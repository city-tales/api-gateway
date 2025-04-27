import { address, jwtPublicKey, organisation, organisationContact, serverUrl, year } from "../config/config.js";
import { ejs, fs, jwt, path, uuidv4 } from "../config/imports.js";
import { logger } from "../config/loki.js";
import { transporter } from "../config/nodemailer.js";
import { Constants } from "./constants.js";
import { __dirname } from "../config/server.js";
import { cacheDB } from "../config/redis.js";
import { RedisResponse } from "./response.js";
import { RedisEmailKeySerialisation } from "./interface.js";

interface Helper {
    isEitherNullOrUndefined(value: string): boolean;
    isEitherNullOrUndefinedOrEmpty(value: string | null | undefined): boolean;
    isArrayEitherNullOrUndefinedOrEmpty(values: any[]): boolean;
    isGenericNeitherNullNorUndefined(value: unknown): boolean;
    isNeitherNullNorUndefined(value: string | null | undefined): boolean;
    isNeitherNullNorUndefinedNorEmpty(value: string | null | undefined): boolean;
    sendStatusSuccessResponse(res, statusCode: number, response);
    sendStatusErrorResponse(res, message: string, statusCode?: number | undefined | null);
    switchOffCaseSensitive(value: string): string;
    convertToClassType<T>(unknownValue: unknown, type: unknown): T;
    convertToType<T>(unknownValue: unknown, type: 'boolean' | 'number' | 'string' | 'object' | 'Object' | 'interface'): T;
    generateContext();
    generateDefaultSuccessParams(tracerId: string, codeIdentifier?: string, source?: string | undefined);
    generateDefaultFailureParams(tracerId: string, codeIdentifier?: string, source?: string | undefined);
    decryptAuthToken(token: string): Object;
    sendEmailForVerification(tracerId: string, params, labels);
    prepareUserRedisKeyValues(key: string, userInfo: RedisEmailKeySerialisation): Object;
    serialiseRedisKeyValues(keyValuePairs: Object): string;
    parseRedisValueToObject(value: string);
    setRedis(tracerId: string, labels, key: string, value: string, timeout?: number): Promise<void>;
}

class HelperImpl implements Helper {
    isEitherNullOrUndefined(value: string | undefined | null): boolean {
        return (value === null || value === undefined) ? true : false;
    }

    isEitherNullOrUndefinedOrEmpty(value: string): boolean {
        return (value === '' || this.isEitherNullOrUndefined(value)) ? true : false;
    }

    isArrayEitherNullOrUndefinedOrEmpty(values: any[]) : boolean {
        let isValueEitherNullOrUndefinedOrEmpty: boolean = false;
        for(let index = 0; index < values.length; ++index) {
            isValueEitherNullOrUndefinedOrEmpty &&= this.isEitherNullOrUndefinedOrEmpty(values[index]);
        }

        return isValueEitherNullOrUndefinedOrEmpty;
    }

    isGenericNeitherNullNorUndefined(value: unknown): boolean {
        return (value !== null && value !== undefined) ? true : false;
    }

    isNeitherNullNorUndefined(value: string | null | undefined): boolean {
        return (value !== null && value !== undefined) ? true : false;
    }

    isNeitherNullNorUndefinedNorEmpty(value: string | null | undefined): boolean {
        return (value !== '' && this.isNeitherNullNorUndefined(value)) ? true : false;
    }

    sendStatusSuccessResponse(res: any, statusCode: number, response) {
        return res.status(statusCode).json(response);
    }
    
    sendStatusErrorResponse(res: any, message: string, statusCode: number | undefined | null) {
        const code = this.isGenericNeitherNullNorUndefined(statusCode) ? statusCode : Constants.STATUS_CODES.INTERNAL_SERVER_ERROR;
        return res.status(code).json({
            message: message,
            code: code,
        });
    }

    switchOffCaseSensitive(value: string) : string {
        return value.toLowerCase();
    }

    convertToClassType<T>(response: unknown, classType: new (...args: any[]) => T): T {
        return response as T;
    }

    convertToType<T>(response: any, type: 'boolean' | 'number' | 'string' | 'object' | 'Object' | 'interface'): T {
        if (type === 'boolean') {
            return (response === 'true' || response === true) as unknown as T;
        }
        if (type === 'number') {
            return Number(response) as unknown as T;
        }
        if (type === 'string') {
            return String(response) as unknown as T;
        }
        if (type === 'object' || type === 'Object') {
            if (typeof response === 'string') {
                return JSON.parse(response) as T;
            }
            return response as T;
        }
        if (type === 'interface') {
            return response as T;
        }
        return response as T;
    }

    generateContext() {
        const tracerId = uuidv4();
        return {
            tracerId: tracerId,
        };
    }

    generateDefaultSuccessParams(tracerId: unknown, codeIdentifier?: string, source?: string | undefined) {
        const timestamp = Date.now();
        
        return {
            success: true,
            distributedTraceId: tracerId,
            timestamp: timestamp,
            requestType : Constants.LOKI_LOGGER_LABELS.REQUEST_TYPE,
            ...(this.isNeitherNullNorUndefinedNorEmpty(codeIdentifier!) && { codeIdentifier }),
            ...(this.isNeitherNullNorUndefinedNorEmpty(source!) && { source })
        };
    }

    generateDefaultFailureParams(tracerId: unknown, codeIdentifier?: string, source?: string | undefined) {
        const timestamp = Date.now();
        
        return {
            success: false,
            distributedTraceId: tracerId,
            timestamp: timestamp,
            requestType : Constants.LOKI_LOGGER_LABELS.REQUEST_TYPE,
            ...(this.isNeitherNullNorUndefinedNorEmpty(codeIdentifier!) && { codeIdentifier }),
            ...(this.isNeitherNullNorUndefinedNorEmpty(source!) && { source })
        };
    }

    decryptAuthToken(token: string): any {
        try {
            const payload = jwt.verify(token, jwtPublicKey, {
                algorithms: Constants.JWT_CONFIG.ALGORITHM
            });
            return payload;
        } 
        catch (error) {
            throw error;
        }
    }

    async sendEmailForVerification(tracerId: string, params, labels) {
        const { token, user } = params;
        const subject = Constants.NODE_MAILER_MESSAGE.SUBJECT;
        const encoding = Constants.NODE_MAILER_MESSAGE.ENCODING;
        const filePath = Constants.EJS_PATHS.RETRY_EMAIL_VERIFICATION;
        const organisationData = {
            organisation: organisation,
            year: year,
            address: address,
            organisationContact: organisationContact,
        };
        
        const url = `${serverUrl}${Constants.ROUTES.AUTHENTICATION}/verify/${token}`;
        let loggerDefaultParams = {};

        try {
            const template = fs.readFileSync(path.join(__dirname, filePath), encoding);
            const renderedHTML = ejs.render(template, { user, url, organisationData });
            const paramsToLog = {
                url: url,
                path: filePath,
                user: user,
                organisationData: organisationData,
            };

            await transporter.sendMail({
                to: user.email,
                subject: subject,
                html: renderedHTML,
            });

            loggerDefaultParams = this.generateDefaultSuccessParams(tracerId, Constants.LOKI_LOGGER_LABELS.WORKER, Constants.NODE_MAILER_MESSAGE.SEND_EMAIL_FOR_VERIFICATION);
            logger.info({
                labels,
                ...loggerDefaultParams,
                paramsToLog,
            });
        } catch (error) {
            loggerDefaultParams = this.generateDefaultFailureParams(tracerId, Constants.LOKI_LOGGER_LABELS.WORKER, Constants.NODE_MAILER_MESSAGE.SEND_EMAIL_FOR_VERIFICATION);
            logger.error({
                labels,
                ...loggerDefaultParams,
                params,
                error,
            });

            throw error;
        }
    }

    prepareUserRedisKeyValues(key: string, userInfo: RedisEmailKeySerialisation): Object {
        return {
            key: key,
            email: this.isEitherNullOrUndefined(userInfo.email) ? Constants.SERIALISATION_KEYS.EMAIL : userInfo.email,
        }
    };

    serialiseRedisKeyValues(keyValuePairs: Object): string {
        const rawString = JSON.stringify(keyValuePairs);
        const serialisedString = rawString.replace(/"/g, "'");

        return serialisedString;
    }

    parseRedisValueToObject(value: string) {
        let serialisedString = value
            .replace(/'/g, '"')
            .replace(/([{,]\s*)("?)([a-zA-Z0-9_]+)\2(?=\s*:)/g, '$1"$3"');

        if (serialisedString.startsWith('"') && serialisedString.endsWith('"')) {
            serialisedString = serialisedString.slice(1, -1);
        }
        const deSerialisedObject = JSON.parse(serialisedString);

        return deSerialisedObject;
    }

    async setRedis(tracerId: string, labels, key: string, value: string, timeout?: number): Promise<void> {
        const switchOffForDev: boolean = this.convertToType<boolean>(Constants.DEV_CONTROLLER.SWTICH_OFF_REDIS, Constants.TYPE_SWITCH.BOOLEAN);
        if (switchOffForDev) return;

        let loggerDefaultParams = {};

        try {
            await cacheDB.set(key, value, {
                EX: timeout ?? Constants.DB_TIMEOUTS.CACHE_DB_REDIS_TIMEOUT
            });

            loggerDefaultParams = this.generateDefaultSuccessParams(tracerId, Constants.LOKI_LOGGER_LABELS.CACHE_DB, Constants.DB.SAVE_IN_REDIS);
            logger.info({
                labels,
                ...loggerDefaultParams,
                request: {
                    key: key,
                    value: value,
                }
            });
        }
        catch (error) {
            loggerDefaultParams = helper.generateDefaultFailureParams(tracerId, Constants.LOKI_LOGGER_LABELS.CACHE_DB);
            logger.error({
                labels,
                ...loggerDefaultParams,
                request: {
                    key: key,
                    value: value,
                },
                error,
            });

            throw new RedisResponse(error);
        }
    }
}

export const helper = new HelperImpl();
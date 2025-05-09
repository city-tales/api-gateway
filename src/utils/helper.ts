import { address, jwtPublicKey, organisation, organisationContact, serverUrl, year } from "../config/config.js";
import { ejs, fs, juice, jwt, path, uuidv4 } from "../config/imports.js";
import { logger } from "../config/loki.js";
import { transporter } from "../config/nodemailer.js";
import { Constants } from "./constants.js";
import { __dirname } from "../config/server.js";
import { cacheDB } from "../config/redis.js";
import { RedisResponse } from "./response.js";
import { RedisEmailKeySerialisation } from "./interface.js";

interface Helper {
    isNotEmpty(value: string): boolean;
    trimStringValue(value: string): string;
    isValidNumeric(value: number): boolean;
    isValidBoolean(value: boolean): boolean;
    isEitherNullOrUndefined(value: string | null | undefined): boolean;
    isEitherNullOrUndefinedOrEmpty(value: string | null | undefined): boolean;
    isGenericEitherNullOrUndefined(value: boolean | number | string | null | undefined): boolean;
    isNeitherNullNorUndefined(value: string | null | undefined): boolean;
    isNeitherNullNorUndefinedNorEmpty(value: string | null | undefined): boolean;
    isGenericNeitherNullNorUndefined(value: boolean | number | string | null | undefined): boolean;
    isGenericNeitherNullNorUndefinedNorInvalid(value: boolean | number | string | null | undefined): boolean;
    isArrayEitherNullOrUndefinedOrEmpty(values: any[]): boolean;
    sendStatusSuccessResponse(res, statusCode: number, response);
    sendStatusErrorResponse(res, message: string, statusCode?: number | undefined | null);
    switchOffCaseSensitive(value: string): string;
    convertToClassType<T>(unknownValue: unknown, type: unknown): T;
    convertToType<T>(unknownValue: unknown, type: 'boolean' | 'number' | 'string' | 'object' | 'Object' | 'interface'): T;
    generateContext();
    generateDefaultSuccessParams(tracerId: string, codeIdentifier?: string, source?: string | undefined);
    generateDefaultFailureParams(tracerId: string, codeIdentifier?: string, source?: string | undefined);
    decryptAuthToken(token: string): Object;
    sendEmail(url: string, filePath: string, subject: string, tracerId: string, renderedHTML, user, labels, source?: string);
    prepareToSendEmail(tracerId: string, params, labels, subject: string, filePath: string, cssPath: string, source: string, url: string);
    prepareUserRedisKeyValues(key: string, userInfo: RedisEmailKeySerialisation): Object;
    serialiseRedisKeyValues(keyValuePairs: Object): string;
    parseRedisValueToObject(value: string);
    setRedis(tracerId: string, labels, key: string, value: string, timeout?: number): Promise<void>;
    logErrorStack(logPayload: any, error: any);
    logResponse(logPayload: any, response);
}

class HelperImpl implements Helper {
    isNotEmpty(value: string): boolean {
        return value === '' ? true : false;
    }

    trimStringValue(value: string): string {
        value = value?.trimStart();
        value = value?.trimEnd();
        return value;
    }

    isValidNumeric(value: number | null | undefined): boolean {
        return this.isGenericNeitherNullNorUndefined(value) && typeof value === 'number' ? true : false;
    }

    isValidBoolean(value: boolean | null | undefined): boolean {
        return this.isGenericNeitherNullNorUndefined(value) && typeof value === 'boolean' ? true : false;
    }
 
    isEitherNullOrUndefined(value: string | null | undefined): boolean {
        return (value === null || value === undefined) ? true : false;
    }

    isEitherNullOrUndefinedOrEmpty(value: string | null | undefined): boolean {
        if(this.isEitherNullOrUndefined(value)) return true;
        return this.trimStringValue(value as string) === "" ? true : false;
    }

    isGenericEitherNullOrUndefined(value: boolean | string | number | null | undefined): boolean {
        return (value === null || value === undefined) ? true : false;
    }

    isNeitherNullNorUndefined(value: string | null | undefined): boolean {
        return (value !== null && value !== undefined) ? true : false;
    }

    isNeitherNullNorUndefinedNorEmpty(value: string | null | undefined): boolean {
        if (this.isNeitherNullNorUndefined(value)) {
            return this.trimStringValue(value as string) !== "" ? true : false;
        }
        return false;
    }

    isGenericNeitherNullNorUndefined(value: boolean | number | string | null | undefined): boolean {
        return (value !== null && value !== undefined) ? true : false;
    }

    isGenericNeitherNullNorUndefinedNorInvalid(value: boolean | number | string | null | undefined): boolean {
        if(this.isGenericNeitherNullNorUndefined(value)) {
            if(typeof value === 'string') return this.isNotEmpty(value);
            if(typeof value === 'number') return this.isValidNumeric(value) && this.isValidNumeric(value);
            if(typeof value === 'boolean') return this.isValidBoolean(value) && this.isValidBoolean(value);
        }
        return false;
    }

    isArrayEitherNullOrUndefinedOrEmpty(values: any[]): boolean {
        let isValueEitherNullOrUndefinedOrEmpty: boolean = false;
        for (let index = 0; index < values.length; ++index) {
            const value = values[index];
            isValueEitherNullOrUndefinedOrEmpty &&= this.isEitherNullOrUndefinedOrEmpty(value);
        }

        return isValueEitherNullOrUndefinedOrEmpty;
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

    switchOffCaseSensitive(value: string): string {
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
            requestType: Constants.LOKI_LOGGER_LABELS.REQUEST_TYPE,
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
            requestType: Constants.LOKI_LOGGER_LABELS.REQUEST_TYPE,
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

    getOrganisationData() {
        return {
            organisation: organisation,
            year: year,
            address: address,
            organisationContact: organisationContact,
        };
    }

    async sendEmail(url: string, filePath: string, subject: string, tracerId: string, renderedHTML, user, labels, source?: string) {
        const organisationData = this.getOrganisationData();

        let loggerDefaultParams = {};
        let genericParamsToLog = {
            url: url,
            path: filePath,
            user: user,
            organisationData: organisationData,
        };
        let logPayload = {
            labels,
            genericParamsToLog,
        };

        try {
            await transporter.sendMail({
                to: user.email,
                subject: subject,
                html: renderedHTML,
            });

            loggerDefaultParams = this.generateDefaultSuccessParams(tracerId, Constants.LOKI_LOGGER_LABELS.WORKER, source);
            logPayload = { ...logPayload, ...loggerDefaultParams };
        }
        catch (error) {
            loggerDefaultParams = this.generateDefaultFailureParams(tracerId, Constants.LOKI_LOGGER_LABELS.WORKER, source);
            logPayload = { ...logPayload, ...loggerDefaultParams };
            logPayload = helper.logErrorStack(logPayload, error);
            logger.error({ ...logPayload });

            throw error;
        }

        logger.info({ ...logPayload });
    }

    async prepareToSendEmail(tracerId: string, params, labels, subject: string, filePath: string, cssPath: string, source: string, url: string) {
        const { user } = params;
        const organisationData = this.getOrganisationData();

        let loggerDefaultParams = {};
        let genericParamsToLog = {
            url: url,
            path: filePath,
            user: user,
            organisationData: organisationData,
        };
        let logPayload = {
            labels,
            genericParamsToLog,
        };

        const template = fs.readFileSync(path.join(__dirname, filePath), Constants.NODE_MAILER_MESSAGE.ENCODING);
        const cssTemplate = fs.readFileSync(path.join(__dirname, cssPath), Constants.NODE_MAILER_MESSAGE.ENCODING);
        const rawHTML = ejs.render(template, { user, url, organisationData, inlineCss: cssTemplate });
        const renderedHTML = juice.inlineContent(rawHTML, cssTemplate);

        try {
            await this.sendEmail(url, filePath, subject, tracerId, renderedHTML, user, labels, source);
        }   
        catch (error) {
            loggerDefaultParams = this.generateDefaultFailureParams(tracerId, Constants.LOKI_LOGGER_LABELS.WORKER, source);
            logPayload = { ...logPayload, ...loggerDefaultParams };
            logPayload = helper.logErrorStack(logPayload, error);
            logger.error({ ...logPayload });

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
        let logPayload = {
            labels,
            request: {
                key: key,
                value: value,
            },
        };

        try {
            await cacheDB.set(key, value, {
                EX: timeout ?? Constants.DB_TIMEOUTS.CACHE_DB_REDIS_TIMEOUT
            });

            loggerDefaultParams = this.generateDefaultSuccessParams(tracerId, Constants.LOKI_LOGGER_LABELS.CACHE_DB, Constants.DB.SAVE_IN_REDIS);
            logPayload = { ...logPayload, ...loggerDefaultParams };
        }
        catch (error) {
            loggerDefaultParams = helper.generateDefaultFailureParams(tracerId, Constants.LOKI_LOGGER_LABELS.CACHE_DB);
            logPayload = { ...logPayload, ...loggerDefaultParams };
            logPayload = helper.logErrorStack(logPayload, error);
            logger.error({ ...logPayload });

            throw new RedisResponse(error);
        }

        logger.info({ ...logPayload });
    }

    logErrorStack(logPayload: any, error: any, customMessage?: string) {
        const cloneLogPayload = {
            ...logPayload,
            error: { ...(logPayload.error || {}) }
        };

        ['message', 'details', 'code', 'statusCode', 'stack', 'name', 'token', 'retryVerification', 'success', 'verified'].forEach((key) => {
            if (this.isGenericNeitherNullNorUndefinedNorInvalid(error[key])) {
                cloneLogPayload.error[key] = error[key];
            }
        });
        if (this.isNeitherNullNorUndefinedNorEmpty(customMessage)) cloneLogPayload.error['message'] = customMessage;

        return cloneLogPayload;
    }

    logResponse(logPayload: any, response: any) {
        const cloneLogPayload = {
            ...logPayload,
            response: { ...(logPayload.response || {}), ...response },
        };

        return cloneLogPayload;
    }
}

export const helper = new HelperImpl();
import { address, jwtPublicKey, organisation, organisationContact, serverUrl, year } from "../config/config.js";
import { ejs, fs, juice, jwt, path, uuidv4 } from "../config/imports.js";
import { logger } from "../config/loki.js";
import { transporter } from "../config/nodemailer.js";
import { Constants } from "./constants.js";
import { __dirname } from "../config/server.js";
import { cacheDB } from "../config/redis.js";
import { RedisResponse } from "./response.js";
import { RedisEmailKeySerialisation } from "./types.js";
import { BooleanOrNullOrUndefined, NumberOrNull, NumberOrNullOrUndefined, StringOrNullOrUndefined, StringOrUndefined } from "./custom_types.js";

interface Helper {
    isNotEmpty(value: string): boolean;
    trimStringValue(value: string): string;
    isValidNumeric(value: number): boolean;
    isValidBoolean(value: boolean): boolean;
    isEitherNullOrUndefined(value: StringOrNullOrUndefined): boolean;
    isEitherNullOrUndefinedOrEmpty(value: StringOrNullOrUndefined): boolean;
    isGenericEitherNullOrUndefined(value: boolean | number | StringOrNullOrUndefined): boolean;
    isNeitherNullNorUndefined(value: StringOrNullOrUndefined): boolean;
    isNeitherNullNorUndefinedNorEmpty(value: StringOrNullOrUndefined): boolean;
    isGenericNeitherNullNorUndefined(value: boolean | number | StringOrNullOrUndefined): boolean;
    isGenericNeitherNullNorUndefinedNorInvalid(value: boolean | number | StringOrNullOrUndefined): boolean;
    isArrayEitherNullOrUndefinedOrEmpty(values: any[]): boolean;
    sendStatusSuccessResponse(res, statusCode: number, response);
    sendStatusErrorResponse(res, message: string, statusCode?: NumberOrNullOrUndefined);
    switchOffCaseSensitive(value: string): string;
    convertToClassType<T>(unknownValue: unknown, type: unknown): T;
    convertToType<T>(unknownValue: unknown, type: 'boolean' | 'number' | 'string' | 'object' | 'Object' | 'interface'): T;
    generateContext();
    generateDefaultSuccessParams(tracerId: string, codeIdentifier?: string, source?: StringOrUndefined);
    generateDefaultFailureParams(tracerId: string, codeIdentifier?: string, source?: StringOrUndefined);
    decryptAuthToken(token: string): Object;
    sendEmail(url: string, filePath: string, subject: string, tracerId: string, renderedHTML, user, labels, source?: string);
    prepareToSendEmail(tracerId: string, params, labels, subject: string, filePath: string, cssPath: string, source: string, url: string);
    prepareUserRedisKeyValues(key: string, userInfo: RedisEmailKeySerialisation): Object;
    serialiseRedisKeyValues(keyValuePairs: Object): string;
    parseRedisValueToObject(value: string);
    setRedis(tracerId: string, labels, key: string, value: string, timeout?: number): Promise<void>;
    serializeError(error);
    serializeErrorStrict(error, options);
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

    isValidNumeric(value: NumberOrNullOrUndefined): boolean {
        return this.isGenericNeitherNullNorUndefined(value) && typeof value === 'number' ? true : false;
    }

    isValidBoolean(value: BooleanOrNullOrUndefined): boolean {
        return this.isGenericNeitherNullNorUndefined(value) && typeof value === 'boolean' ? true : false;
    }
 
    isEitherNullOrUndefined(value: StringOrNullOrUndefined): boolean {
        return (value === null || value === undefined) ? true : false;
    }

    isEitherNullOrUndefinedOrEmpty(value: StringOrNullOrUndefined): boolean {
        if(this.isEitherNullOrUndefined(value)) return true;
        return this.trimStringValue(value as string) === "" ? true : false;
    }

    isGenericEitherNullOrUndefined(value: boolean | string | NumberOrNullOrUndefined): boolean {
        return (value === null || value === undefined) ? true : false;
    }

    isNeitherNullNorUndefined(value: StringOrNullOrUndefined): boolean {
        return (value !== null && value !== undefined) ? true : false;
    }

    isNeitherNullNorUndefinedNorEmpty(value: StringOrNullOrUndefined): boolean {
        if (this.isNeitherNullNorUndefined(value)) {
            return this.trimStringValue(value as string) !== "" ? true : false;
        }
        return false;
    }

    isGenericNeitherNullNorUndefined(value: boolean | number | StringOrNullOrUndefined): boolean {
        return (value !== null && value !== undefined) ? true : false;
    }

    isGenericNeitherNullNorUndefinedNorInvalid(value: boolean | number | StringOrNullOrUndefined): boolean {
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
        if (response && Object.prototype.hasOwnProperty.call(response, "token")) {
            delete response.token;
        }
        return res.status(statusCode).json(response);
    }

    sendStatusErrorResponse(res: any, message: string, statusCode: NumberOrNullOrUndefined) {
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

    generateDefaultSuccessParams(tracerId: unknown, codeIdentifier?: string, source?: StringOrUndefined) {
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

    generateDefaultFailureParams(tracerId: unknown, codeIdentifier?: string, source?: StringOrUndefined) {
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

    /**
     * Helper function to serialize error objects with only defined and non-empty properties
     * @param {Error} error - The error object to serialize
     * @returns {Object} - Serialized error object with only meaningful properties
     */
    serializeError(error) {
        if (!error) return {};
        
        const serialized = {};
        const standardProps = [
            'name', 'message', 'stack', 'code', 'statusCode', 
            'status', 'errno', 'syscall', 'path', 'cause'
        ];
        
        const isValidValue = (value) => {
            if (Array.isArray(value) && value.length === 0) return false;
            if (typeof value === 'object' && Object.keys(value).length === 0) return false;
            if (this.isGenericNeitherNullNorUndefinedNorInvalid(value)) return false;
            return true;
        };
        
        standardProps.forEach(prop => {
            if (prop in error && isValidValue(error[prop])) {
                try {
                    serialized[prop] = error[prop];
                } catch (e) {
                    // Skip properties that can't be accessed
                }
            }
        });
        
        for (const key in error) {
            if (error.hasOwnProperty(key) && 
                !(key in serialized) && 
                isValidValue(error[key])) {
                try {
                    serialized[key] = error[key];
                } catch (e) {
                    // Skip properties that can't be serialized
                }
            }
        }
        
        const nonEnumerableProps = Object.getOwnPropertyNames(error);
        nonEnumerableProps.forEach(prop => {
            if (!(prop in serialized) && 
                isValidValue(error[prop]) && 
                typeof error[prop] !== 'function') {
                try {
                    serialized[prop] = error[prop];
                } catch (e) {
                    // Skip properties that can't be accessed
                }
            }
        });
        
        return serialized;
    }

    /**
     * Alternative version with more strict filtering options
     * @param {Error} error - The error object to serialize
     * @param {Object} options - Configuration options
     * @returns {Object} - Serialized error object
     */
    serializeErrorStrict(error, options = {}) {
        if (!error) return {};
        
        const {
            includeStack = true,
            includeEmptyStrings = false,
            includeZeroValues = true,
            includeFunctions = false,
            customProps = []
        }: any = options;
        
        const serialized = {};
        
        // Standard properties to always check
        const standardProps = [
            'name', 'message', 
            ...(includeStack ? ['stack'] : []),
            'code', 'statusCode', 'status', 'errno', 
            'syscall', 'path', 'cause', ...customProps
        ];
        
        // More granular validation
        const isValidValue = (value, key) => {
            if (value === null || value === undefined) return false;
            
            if (typeof value === 'string') {
                if (!includeEmptyStrings && value.trim() === '') return false;
                return true;
            }
            
            if (typeof value === 'number') {
                if (!includeZeroValues && value === 0) return false;
                return !isNaN(value);
            }
            
            if (typeof value === 'function' && !includeFunctions) return false;
            
            if (typeof value === 'object') {
                if (Array.isArray(value)) return value.length > 0;
                return Object.keys(value).length > 0;
            }
            
            return true;
        };
        
        // Process all possible properties
        const allProps = [
            ...standardProps,
            ...Object.keys(error),
            ...Object.getOwnPropertyNames(error)
        ];
        
        // Remove duplicates
        const uniqueProps = [...new Set(allProps)];
        
        uniqueProps.forEach(prop => {
            if (prop in error && isValidValue(error[prop], prop)) {
                try {
                    serialized[prop] = error[prop];
                } catch (e) {
                    // Skip properties that can't be accessed
                }
            }
        });
        
        return serialized;
    }

    logErrorStack(logPayload: any, error: any, customMessage?: string) {
        const errorObj = this.serializeError(error);
        const cloneLogPayload = {
            ...logPayload,
            error: { ...(logPayload.error || errorObj || {}) }
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
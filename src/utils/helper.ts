import { address, organisation, organisationContact, serverUrl, year } from "../config/config.js";
import { ejs, fs, path, uuidv4 } from "../config/imports.js";
import { logger } from "../config/loki.js";
import { transporter } from "../config/nodemailer.js";
import { Constants } from "./constants.js";
import { __dirname } from "../config/server.js";

interface Helper {
    isEitherNullOrUndefined(value: string) : boolean;
    isEitherNullOrUndefinedOrEmpty(value: string) : boolean;
    isArrayEitherNullOrUndefinedOrEmpty(values: any[]) : boolean;
    isGenericNeitherNullNorUndefined(value: unknown) : boolean;
    isNeitherNullNorUndefined(value: string) : boolean;
    isNeitherNullNorUndefinedNorEmpty(value: string) : boolean;
    sendStatusSuccessResponse(res, statusCode: number, response);
    sendStatusErrorResponse(res, message: string, statusCode?: number | undefined | null);
    switchOffCaseSensitive(value: string) : string;
    convertToClassType<T>(unknownValue: unknown, type: unknown): T;
    convertToType<T>(unknownValue: unknown): T;
    generateContext();
    generateDefaultSuccessParams(tracerId: string, codeIdentifier?: string, source?: string | undefined);
    generateDefaultFailureParams(tracerId: string, codeIdentifier?: string, source?: string | undefined);
    sendEmailForVerification(tracerId: string, params, labels);
}

class HelperImpl implements Helper {
    isEitherNullOrUndefined(value: string): boolean {
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

    isNeitherNullNorUndefined(value: string): boolean {
        return (value !== null && value !== undefined) ? true : false;
    }

    isNeitherNullNorUndefinedNorEmpty(value: string): boolean {
        return (value !== '' && this.isNeitherNullNorUndefined(value)) ? true : false;
    }

    sendStatusSuccessResponse(res: any, statusCode: number, response) {
        return res.status(statusCode).json(response);
    }
    
    sendStatusErrorResponse(res: any, message: string, statusCode: number | undefined | null) {
        const code = this.isGenericNeitherNullNorUndefined(statusCode) ? statusCode : Constants.STATUS_CODES.INTERNAL_SERVER_ERROR;
        return res.status(statusCode).json({
            message: message,
            code: statusCode,
        });
    }

    switchOffCaseSensitive(value: string) : string {
        return value.toLowerCase();
    }

    convertToClassType<T>(response: unknown, classType: new (...args: any[]) => T): T {
        return response as T;
    }

    convertToType<T>(response: unknown): T {
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

    async sendEmailForVerification(tracerId: string, params, labels) {
        const { token, user, subject, encoding, filePath } = params;
        const organisationData = {
            organisation: organisation,
            year: year,
            address: address,
            organisationContact: organisationContact,
        };
        
        const url = `${serverUrl}/verify/${token}`;
        let loggerDefaultParams = {};

        try {
            const template = fs.readFileSync(path.join(__dirname, filePath), encoding);
            const renderedHTML = ejs.render(template, { user, url, organisationData });

            await transporter.sendMail({
                to: user.email,
                subject: subject,
                html: renderedHTML,
            });

            loggerDefaultParams = this.generateDefaultSuccessParams(tracerId, Constants.LOKI_LOGGER_LABELS.WORKER, Constants.NODE_MAILER_MESSAGE.SEND_EMAIL_FOR_VERIFICATION);
            logger.info({
                labels,
                ...loggerDefaultParams,
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
}

export const helper = new HelperImpl();
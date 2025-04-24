import { uuidv4 } from "../config/imports.js";

interface Helper {
    isEitherNullOrUndefined(value: string) : boolean;
    isEitherNullOrUndefinedOrEmpty(value: string) : boolean;
    isArrayEitherNullOrUndefinedOrEmpty(values: any[]) : boolean;
    isNeitherNullNorUndefined(value: string) : boolean;
    isNeitherNullNorUndefinedNorEmpty(value: string) : boolean;
    sendStatusSuccessResponse(res, statusCode: number, response);
    sendStatusErrorResponse(res, statusCode: number, message: string);
    switchOffCaseSensitive(value: string) : string;
    convertToClassType<T>(unknownValue: unknown, type: unknown): T;
    convertToType<T>(unknownValue: unknown): T;
    generateContext();
    generateDefaultSuccessParams(tracerId: unknown);
    generateDefaultFailureParams(tracerId: unknown);
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

    isNeitherNullNorUndefined(value: string): boolean {
        return (value !== null && value !== undefined) ? true : false;
    }

    isNeitherNullNorUndefinedNorEmpty(value: string): boolean {
        return (value !== '' && this.isNeitherNullNorUndefined(value)) ? true : false;
    }

    sendStatusSuccessResponse(res: any, statusCode: number, response) {
        return res.status(statusCode).json(response);
    }
    
    sendStatusErrorResponse(res: any, statusCode: number, message: string) {
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

    generateDefaultSuccessParams(tracerId: unknown) {
        const timestamp = Date.now();
        
        return {
            context: tracerId,
            defaultSuccessParams: {
                tracerId,
                timestamp,
                success: true,
            },
        };
    }

    generateDefaultFailureParams(tracerId: unknown) {
        const timestamp = Date.now();
        
        return {
            context: tracerId,
            defaultFailureParams: {
                tracerId,
                timestamp,
                success: false,
            },
        };
    }
}

export const helper = new HelperImpl();
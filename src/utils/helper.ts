interface Helper {
    isEitherNullOrUndefined(value: string) : boolean;
    isEitherNullOrUndefinedOrEmpty(value: string) : boolean;
    isArrayEitherNullOrUndefinedOrEmpty(values: any[]) : boolean;
    isNeitherNullNorUndefined(value: string) : boolean;
    isNeitherNullNorUndefinedNorEmpty(value: string) : boolean;
    sendStatusResponse(res, statusCode: number, message: string);
    sendStatusErrorResponse(res, statusCode: number, message: string);
    switchOffCaseSensitive(value: string) : string;
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

    sendStatusResponse(res: any, statusCode: number, message: string) {
        return res.status(statusCode).send(message);
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
}

export const helper = new HelperImpl();
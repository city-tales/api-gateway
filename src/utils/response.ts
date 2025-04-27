import { Constants } from "./constants.js";

export class RedisResponse {
    public token: string;
    public message: string;
    public statusCode: number;

    constructor(response?: RedisResponse) {
        this.token = response?.token ?? Constants.SIGNUP_MESSAGE.EMPTY_TOKEN;
        this.message = response?.message ?? Constants.REDIS_MESSAGE.FAILED;
        this.statusCode = response?.statusCode ?? Constants.STATUS_CODES.BAD_GATEWAY;
    }
}
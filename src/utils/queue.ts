import { Queue } from "../config/imports.js";
import { Constants } from "./constants.js";
import { bullMQConnectionObject } from "../config/redis.js";

export const saveInRedisQueueEmployee = new Queue(Constants.DB.SAVE_IN_REDIS, {
    connection: bullMQConnectionObject.connection
});

export const retryEmailVerification = new Queue(Constants.QUEUE_DB.EMAIL_VERIFICATION, {
    connection: bullMQConnectionObject.connection
});

export const passwordlessAuthenticationEmployee = new Queue(Constants.QUEUE_DB.PASSWORDLESS, {
    connection: bullMQConnectionObject.connection
});
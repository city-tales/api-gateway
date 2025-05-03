import { createClient } from "./imports.js";
import { cacheDBRedisHost, cacheDBRedisPassword, cacheDBRedisPort, cacheDBRedisUsername, queueDBRedisHost, queueDBRedisPassword, queueDBRedisPort, queueDBRedisUrl } from "./config.js";
import { Constants } from "../utils/constants.js";

const cacheDB = createClient({
    username: cacheDBRedisUsername,
    password: cacheDBRedisPassword,
    socket: {
        host: cacheDBRedisHost,
        port: Number(cacheDBRedisPort),
    }
});

const queueDB = createClient({
    url: queueDBRedisUrl
});

const bullMQConnectionObject = {
    connection: {
        host: queueDBRedisHost,
        port: queueDBRedisPort,
        password: queueDBRedisPassword,
        tls: {},
        // maxRetriesPerRequest: null,
    },
};

var settings = {
    stalledInterval: Constants.QUEUE_DB.STALLED_TIMEOUT_INTERVAL,
    guardInterval: Constants.QUEUE_DB.GUARD_TIMEOUT_INTERVAL,
    drainDelay: Constants.QUEUE_DB.DRAIN_DELAY_TIMEOUT,
};

const defaultQueueSettings = {
    attempts: Constants.QUEUE_DB.MAX_ATTEMPTS,
    backoff: {
        type: Constants.QUEUE_DB.BACKOFF_EXPONENTIAL,
        delay: Constants.QUEUE_DB.BACKOFF_DELAY,
    },
};

export {
    cacheDB,
    queueDB,
    bullMQConnectionObject,
    defaultQueueSettings,
};
import 'dotenv/config';

const organisation = process.env.ORGANISATION;
const year = process.env.YEAR;
const address = process.env.ADDRESS;
const organisationContact = process.env.ORGANISATION_CONTACT;
const port = process.env.PORT;
const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;
const jwtPublicKey = process.env.JWT_PUBLIC_KEY;
const serverUrl = process.env.SERVER_URL;
const frontendUrl = process.env.FRONTEND_URL;
const grpcBaseUrl = process.env.GRPC_BASE_URL;
const lokiLoggerName = process.env.LOKI_LOGGER_NAME;
const lokiLoggerUrl = process.env.LOKI_LOGGER_URL;
const lokiLoggerUser = process.env.LOKI_LOGGER_USER;
const lokiLoggerToken = process.env.LOKI_LOGGER_TOKEN;
const nodeMailerService = process.env.NODEMAILER_SERVICE;
const nodeMailerPort = process.env.NODEMAILER_PORT;
const nodeMailerUser = process.env.NODEMAILER_USER_EMAIL;
const nodeMailerPassword = process.env.NODEMAILER_USER_PASSWORD;
const cacheDBRedisUsername = process.env.CACHE_DB_REDIS_USERNAME;
const cacheDBRedisPassword = process.env.CACHE_DB_REDIS_PASSWORD;
const cacheDBRedisHost = process.env.CACHE_DB_REDIS_HOST;
const cacheDBRedisPort = process.env.CACHE_DB_REDIS_PORT;
const queueDBRedisUsername = process.env.QUEUE_DB_REDIS_USERNAME;
const queueDBRedisPassword = process.env.QUEUE_DB_REDIS_PASSWORD;
const queueDBRedisHost = process.env.QUEUE_DB_REDIS_HOST;
const queueDBRedisPort = parseInt(process.env.QUEUE_DB_REDIS_PORT);
const queueDBRedisUrl = process.env.QUEUE_DB_REDIS_URL;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUrl = process.env.GOOGLE_REDIRECT_URL;
const googleTokenApi = process.env.GOOGLE_TOKEN_API;

export {
    organisation,
    year,
    address,
    organisationContact,
    port,
    jwtPrivateKey,
    jwtPublicKey,
    serverUrl,
    frontendUrl,
    grpcBaseUrl,
    lokiLoggerName,
    lokiLoggerUrl,
    lokiLoggerUser,
    lokiLoggerToken,
    nodeMailerService,
    nodeMailerPort,
    nodeMailerUser,
    nodeMailerPassword,
    cacheDBRedisUsername,
    cacheDBRedisPassword,
    cacheDBRedisHost,
    cacheDBRedisPort,
    queueDBRedisUsername,
    queueDBRedisPassword,
    queueDBRedisHost,
    queueDBRedisPort,
    queueDBRedisUrl,
    googleClientId,
    googleClientSecret,
    googleRedirectUrl,
    googleTokenApi,
};
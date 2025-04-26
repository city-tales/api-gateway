import 'dotenv/config';

const organisation = process.env.ORGANISATION;
const year = process.env.YEAR;
const address = process.env.ADDRESS;
const organisationContact = process.env.ORGANISATION_CONTACT;
const port = process.env.PORT;
const jwtPublicKey = process.env.JWT_PUBLIC_KEY;
const serverUrl = process.env.SERVER_URL;
const grpcBaseUrl = process.env.GRPC_BASE_URL;
const lokiLoggerName = process.env.LOKI_LOGGER_NAME;
const lokiLoggerUrl = process.env.LOKI_LOGGER_URL;
const lokiLoggerUser = process.env.LOKI_LOGGER_USER;
const lokiLoggerToken = process.env.LOKI_LOGGER_TOKEN;
const nodeMailerService = process.env.NODEMAILER_SERVICE;
const nodeMailerPort = process.env.NODEMAILER_PORT;
const nodeMailerUser = process.env.NODEMAILER_USER_EMAIL;
const nodeMailerPassword = process.env.NODEMAILER_USER_PASSWORD;

export {
    organisation,
    year,
    address,
    organisationContact,
    port,
    jwtPublicKey,
    serverUrl,
    grpcBaseUrl,
    lokiLoggerName,
    lokiLoggerUrl,
    lokiLoggerUser,
    lokiLoggerToken,
    nodeMailerService,
    nodeMailerPort,
    nodeMailerUser,
    nodeMailerPassword,
};
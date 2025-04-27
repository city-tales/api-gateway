import 'dotenv/config';

const PORT = process.env.PORT;
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;
const GRPC_BASE_URL = process.env.GRPC_BASE_URL;
const lokiLoggerName = process.env.LOKI_LOGGER_NAME;
const lokiLoggerUrl = process.env.LOKI_LOGGER_URL;
const lokiLoggerUser = process.env.LOKI_LOGGER_USER;
const lokiLoggerToken = process.env.LOKI_LOGGER_TOKEN;

export {
    PORT,
    JWT_PUBLIC_KEY,
    GRPC_BASE_URL,
    lokiLoggerName,
    lokiLoggerUrl,
    lokiLoggerUser,
    lokiLoggerToken,
};
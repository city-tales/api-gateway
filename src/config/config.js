import 'dotenv/config';

const PORT = process.env.PORT;
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;
const GRPC_BASE_URL = process.env.GRPC_BASE_URL;

export {
    PORT,
    JWT_PUBLIC_KEY,
    GRPC_BASE_URL,
}
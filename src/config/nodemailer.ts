import { nodeMailerPassword, nodeMailerPort, nodeMailerService, nodeMailerUser } from "./config.js";
import { nodemailer } from "./imports.js";

export const transporter = nodemailer.createTransport({
    service: nodeMailerService,
    port: nodeMailerPort,
    secure: true,
    secureConnection: false,
    auth: {
        user: nodeMailerUser,
        pass: nodeMailerPassword,
    },
    tls: {
        rejectUnauthorized: true,
    },
});
import { z } from "../config/imports.js";

export const EmailForgotPasswordHTTPRequest = z.object({
    email: z.string().email(),
});
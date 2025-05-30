import { z } from "../config/imports.js";

export const EmailLoginHTTPRequest = z.object({
    email: z.string().email(),
    password: z.string(),
});
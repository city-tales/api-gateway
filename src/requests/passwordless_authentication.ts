import { z } from "../config/imports.js";

export const PasswordlessAuthenticationHTTPRequest = z.object({
    email: z.string().email(),
});
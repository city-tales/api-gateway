import { z } from "../config/imports.js";

export const EmailSignUpHTTPRequest = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    primaryCountryCode: z.string(),
    phoneNumber: z.string(),
    secondaryCountryCode: z.string(),
    alternatePhone: z.string(),
});
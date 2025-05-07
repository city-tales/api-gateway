import { z } from "../config/imports.js";

export const PasswordlessAuthenticationInterface = z.object({
    userDeviceInformation: z.object({
        browserInfo: z.string(),
        deviceId: z.string(),
        deviceName: z.string(),
        deviceType: z.string(),
        ipAddress: z.string(),
        loginTime: z.string(),
        platform: z.string(),
    }),
    userPasswordlessAuthenticationRequest: z.object({
        name: z.string(),
        email: z.string().email(),
    }),
});
import { z } from "../config/imports.js";

export const RawGoogleAuthenticationHTTPRequest = z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    name: z.string(),
    profilePicture: z.string(),
    verifiedEmail: z.boolean(),
});

export const GoogleAuthenticationHTTPRequest = z.object({
    userDeviceInformation: z.object({
        deviceType: z.string(),
        browserInfo: z.string(),
        deviceId: z.string(),
        deviceName: z.string(),
        ipAddress: z.string(),
        loginTime: z.string(),
        platform: z.string(),
    }),
    userGoogleAuthenticationRequest: z.object({
        email: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
        name: z.string(),
        profilePicture: z.string(),
        verifiedEmail: z.boolean(),
    }),
});
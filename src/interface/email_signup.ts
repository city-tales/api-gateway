import { z } from "../config/imports.js";

export const EmailSignUpInterface = z.object({
  userDeviceInformation: z.object({
    browserInfo: z.string(),
    deviceId: z.string(),
    deviceName: z.string(),
    deviceType: z.string(),
    ipAddress: z.string(),
    loginTime: z.string(),
    platform: z.string(),
  }),
  userEmailSignUpRequest: z.object({
    email: z.string().email(),
    alternatePhone: z.string(),
    name: z.string(),
    password: z.string(),
    phoneNumber: z.string(),
    primaryCountryCode: z.string(),
    secondaryCountryCode: z.string(),
  }),
});
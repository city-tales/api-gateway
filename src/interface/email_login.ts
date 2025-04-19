import { z } from "../config/imports.js";

export const EmailLoginInterface = z.object({
  userDeviceInformation: z.object({
    browserInfo: z.string(),
    deviceId: z.string(),
    deviceName: z.string(),
    deviceType: z.string(),
    ipAddress: z.string(),
    loginTime: z.string(),
    platform: z.string(),
  }),
  userEmailLoginRequest: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});
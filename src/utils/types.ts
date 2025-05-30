import { StringOrNull, StringOrNullOrUndefined } from "./custom_types.js";

export type RedisEmailKeySerialisation = {
    email: StringOrNullOrUndefined,
};

export type DeviceType = {
    deviceType?: StringOrNull,
    browserInfo?: StringOrNull,
    ipAddress?: StringOrNull,
    deviceId?: StringOrNull,
    platform?: StringOrNull,
    deviceName?: StringOrNull,
    loginTime?: Date | StringOrNull,
};
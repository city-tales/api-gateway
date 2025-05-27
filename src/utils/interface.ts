import { StringOrNull, StringOrNullOrUndefined } from "./custom_types.js";

export interface RedisEmailKeySerialisation {
    email: StringOrNullOrUndefined,
};

export interface DeviceInterface {
    deviceType?: StringOrNull,
    browserInfo?: StringOrNull,
    ipAddress?: StringOrNull,
    deviceId?: StringOrNull,
    platform?: StringOrNull,
    deviceName?: StringOrNull,
    loginTime?: Date | StringOrNull,
};
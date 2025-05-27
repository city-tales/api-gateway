export interface RedisEmailKeySerialisation {
    email: string | null | undefined,
};

export interface DeviceInterface {
    deviceType?: string,
    browserInfo?: string,
    ipAddress?: string,
    deviceId?: string,
    platform?: string,
    deviceName?: string,
    loginTime?: Date | string,
};
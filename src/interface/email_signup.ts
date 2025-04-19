export interface EmailSignUpInterface {
    userDeviceInformation: {
        browserInfo: string;
        deviceId: string;
        deviceName: string;
        deviceType: string;
        ipAddress: string;
        loginTime: string;
        platform: string;
    };
    userEmailSignUpRequest: {
        alternatePhone: string;
        email: string;
        name: string;
        password: string;
        phoneNumber: string;
        primaryCountryCode: string;
        secondaryCountryCode: string;
    };
}

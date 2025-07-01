import { DeviceType } from "../utils/types.js";

interface GRPCRequest {
    emailSignUpRequest(emailSignUpRequest, userDeviceInformation: DeviceType);
    emailLoginRequest(emailLoginRequest, userDeviceInformation: DeviceType);
    emailForgotPasswordRequest(emailForgotPasswordRequest: any, userDeviceInformation: DeviceType);
    passwordlessAuthenticationRequest(passwordlessAuthenticationRequest: any, userDeviceInformation: DeviceType);
    googleAuthenticationRequest(googleAuthenticationRequest: any, userDeviceInformation: DeviceType);
    updatePasswordForEmailRequest(id: string, updatePasswordForEmailRequest: any);
}

class GRPCRequestImpl implements GRPCRequest {
    emailSignUpRequest(emailSignUpRequest: any, userDeviceInformation: DeviceType) {
        return {
            userEmailSignUpRequest: { ...emailSignUpRequest },
            userDeviceInformation: { ...userDeviceInformation }
        };
    }

    emailLoginRequest(emailLoginRequest: any, userDeviceInformation: DeviceType) {
        return {
            userEmailLoginRequest: { ...emailLoginRequest },
            userDeviceInformation: { ...userDeviceInformation }
        };
    }

    emailForgotPasswordRequest(emailForgotPasswordRequest: any, userDeviceInformation: DeviceType) {
        return {
            userEmailForgotPasswordRequest: { ...emailForgotPasswordRequest },
            userDeviceInformation: { ...userDeviceInformation }
        };
    }

    passwordlessAuthenticationRequest(passwordlessAuthenticationRequest: any, userDeviceInformation: DeviceType) {
        return {
            userPasswordlessAuthenticationRequest: { ...passwordlessAuthenticationRequest },
            userDeviceInformation: { ...userDeviceInformation }
        };
    }

    googleAuthenticationRequest(googleAuthenticationRequest: any, userDeviceInformation: DeviceType) {
        return {
            userGoogleAuthenticationRequest: { ...googleAuthenticationRequest },
            userDeviceInformation: { ...userDeviceInformation },
        }
    }

    updatePasswordForEmailRequest(id: string, updatePasswordForEmailRequest: any) {
        return { 
            id: id, 
            ...updatePasswordForEmailRequest 
        }
    }
}

export const grpcProtoRequest = new GRPCRequestImpl();
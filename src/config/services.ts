enum AuthRpcServices {
    EmailSignUp = 'EmailSignUp',
    EmailLogin = 'EmailLogin',
    EmailVerification = 'EmailVerification',
    EmailForgotPassword = 'EmailForgotPassword',
    GoogleAuthentication = 'GoogleAuthentication',
    PasswordlessAuthentication = 'PasswordlessAuthentication',
    UpdatePasswordForEmail = 'UpdatePasswordForEmail',
};

enum RpcRequest {
    AuthRpcRequest = 'AuthRpcRequest',
};

export class Services {
    static readonly AuthRpcServices = AuthRpcServices;
    static readonly RpcRequest = RpcRequest;
};
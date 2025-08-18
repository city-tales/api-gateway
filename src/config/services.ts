enum AuthRpcServices {
    EmailSignUp = 'EmailSignUp',
    EmailLogin = 'EmailLogin',
    EmailVerification = 'EmailVerification',
    EmailForgotPassword = 'EmailForgotPassword',
    GoogleAuthentication = 'GoogleAuthentication',
    PasswordlessAuthentication = 'PasswordlessAuthentication',
    UpdatePasswordForEmail = 'UpdatePasswordForEmail',
    HealthCheck = 'HealthCheck',
};

enum RpcRequest {
    AuthRpcRequest = 'AuthRpcRequest',
};

export class Services {
    static readonly AuthRpcServices = AuthRpcServices;
    static readonly RpcRequest = RpcRequest;
};
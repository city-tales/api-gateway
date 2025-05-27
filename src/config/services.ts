enum AuthRpcServices {
    EmailSignUp = 'EmailSignUp',
    EmailLogin = 'EmailLogin',
    EmailVerification = 'EmailVerification',
    GoogleAuthentication = 'GoogleAuthentication',
    PasswordlessAuthentication = 'PasswordlessAuthentication',
};

enum RpcRequest {
    AuthRpcRequest = 'AuthRpcRequest',
};

export class Services {
    static readonly AuthRpcServices = AuthRpcServices;
    static readonly RpcRequest = RpcRequest;
};
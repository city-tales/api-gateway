enum AuthRpcServices {
    EmailSignUp = 'EmailSignUp',
    EmailLogin = 'EmailLogin',
    EmailVerification = 'EmailVerification',
    GoogleAuth = 'GoogleAuth',
    PasswordlessAuthentication = 'PasswordlessAuthentication',
};

enum RpcRequest {
    AuthRpcRequest = 'AuthRpcRequest',
};

export class Services {
    static readonly AuthRpcServices = AuthRpcServices;
    static readonly RpcRequest = RpcRequest;
};
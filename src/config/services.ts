enum AuthRpcServices {
    EmailSignUp = 'EmailSignUp',
    EmailLogin = 'EmailLogin',
    GoogleAuth = 'GoogleAuth'
};

enum RpcRequest {
    AuthRpcRequest = 'AuthRpcRequest',
};

export class Services {
    static readonly AuthRpcServices = AuthRpcServices;
    static readonly RpcRequest = RpcRequest;
};
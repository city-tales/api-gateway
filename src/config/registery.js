import { grpc, protoLoader, AUTH_PROTO_PATH } from "./imports.js";
import { GRPC_BASE_URL } from "./config.js";
import { Services } from "./services.js";

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const authPackageDefinition = protoLoader.loadSync(AUTH_PROTO_PATH, options);
const authRpcRequestProto = grpc.loadPackageDefinition(authPackageDefinition);

const rpcRequestServices = {
    authRpcRequestService: authRpcRequestProto.service.RpcRequestService,
}

const rpcRequestServiceMap = {
    [Services.RpcRequest.AuthRpcRequest]: rpcRequestServices['authRpcRequestService'],
};

const clients = {};

for (const [serviceName, ServiceConstructor] of Object.entries(rpcRequestServiceMap)) {
    clients[serviceName] = new ServiceConstructor(
        GRPC_BASE_URL,
        grpc.credentials.createInsecure()
    );
}

export {
    clients
};

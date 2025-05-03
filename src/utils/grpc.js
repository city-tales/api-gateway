import { grpc } from "../config/imports.js";

export const grpcRequest = (client, methodName, requestData, context = {}) => {
    return new Promise((resolve, reject) => {
        const meta = new grpc.Metadata();
        Object.entries(context).forEach(([key, value]) => {
            meta.set(key, value);
        });

        client[methodName](requestData, meta, (error, response) => {
            if (error) return reject(error);
            resolve(response);
        });
    });
};
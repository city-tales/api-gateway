export const grpcRequest = (client, methodName, requestData) => {
    return new Promise((resolve, reject) => {
        client[methodName](requestData, (error, response) => {
            if (error) return reject(error);
            resolve(response);
        });
    });
};
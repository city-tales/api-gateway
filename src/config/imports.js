import express  from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const server = express();
const AUTH_PROTO_PATH = "../shared-proto/authentication/rpc_request.proto";

export {
    express,
    cors,
    jwt,
    server,
    grpc,
    protoLoader,
    AUTH_PROTO_PATH,
};
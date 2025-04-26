import express  from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { createLogger, transports, format } from "winston";
import winston from "winston";
import LokiTransport from 'winston-loki';
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import ejs from 'ejs';

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
    z,
    uuidv4,
    createLogger,
    transports,
    format,
    winston,
    LokiTransport,
    nodemailer,
    fs,
    path,
    fileURLToPath,
    ejs,
};
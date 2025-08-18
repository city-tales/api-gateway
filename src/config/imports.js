import express  from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";
import jwt from "jsonwebtoken";
import lodash from "lodash";
import _ from 'lodash';
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import redis from "redis"; const { createClient } = redis;
import { Worker, Job, Queue } from 'bullmq';
import { createLogger, transports, format } from "winston";
import winston from "winston";
import LokiTransport from 'winston-loki';
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import juice from "juice";
import axios from "axios";

const server = express();
const AUTH_PROTO_PATH = path.resolve(process.cwd(), "shared-proto/authentication/rpc_request.proto");

export {
    express,
    cookieParser,
    cors,
    jwt,
    lodash,
    _,
    server,
    grpc,
    protoLoader,
    AUTH_PROTO_PATH,
    z,
    uuidv4,
    createClient,
    Worker,
    Job,
    Queue,
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
    juice,
    axios,
};
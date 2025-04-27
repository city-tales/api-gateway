import { logger } from "../config/loki.js";
import { cacheDB } from "../config/redis.js";
import { clients } from "../config/registery.js";
import { Services } from "../config/services.js";
import { EmailLoginInterface } from "../interface/email_login.js";
import { EmailSignUpInterface } from "../interface/email_signup.js";
import { Constants } from "../utils/constants.js";
import { helper } from "../utils/helper.js";
import { grpcRequest } from "../utils/network.js";
import { queueEmployee } from "../utils/worker.js";
import { router } from "./router.js";

router.post(`${Constants.ROUTES.HOME}`, async (req, res) => {
    const { channel, purpose } = req[Constants.REQUEST_PAYLOAD.HEADERS];
    if (helper.isArrayEitherNullOrUndefinedOrEmpty([channel, purpose]))
        return helper.sendStatusErrorResponse(res, Constants.ERRORS.BAD_REQUEST, Constants.STATUS_CODES.BAD_REQUEST);

    const handlers = {
        [Constants.AUTH_CHANNELS.EMAIL]: {
            [Constants.AUTH_PURPOSE.LOGIN]: emailLogin,
            [Constants.AUTH_PURPOSE.SIGNUP]: emailSignUp,
            [Constants.AUTH_PURPOSE.RETRY_EMAIL_VERIFICATION]: retryEmailVerification,
        },
    };

    try {
        const handler = handlers?.[channel]?.[purpose];

        if (helper.isNeitherNullNorUndefinedNorEmpty(handler))
            return await handler(req, res);
        else
            return helper.sendStatusErrorResponse(res, Constants.ERRORS.INTERNAL_SERVER_ERROR, Constants.STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    catch (error) {
        return helper.sendStatusErrorResponse(res, error.message, Constants.STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
});

router.get(`${Constants.ROUTES.EMAIL_VERIFICATION}`, async (req, res) => {
    const token = req.params.id;
    const labels = {
        operation: Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION,
        type: Constants.LOKI_LOGGER_LABELS.EMAIL,
    };
    const context = helper.generateContext();
    let loggerDefaultParams = {};

    if (!token) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION);
        logger.error({
            labels,
            ...loggerDefaultParams,
            token,
            error: Constants.JWT.MISSING,
        });

        return helper.sendStatusErrorResponse(res, Constants.JWT.MISSING, Constants.STATUS_CODES.NOT_FOUND);
    }

    let response = {    
        success: false,
        message: helper.convertToType<string>(Constants.ERRORS.INTERNAL_SERVER_ERROR, Constants.TYPE_SWITCH.STRING),
        statusCode: Constants.STATUS_CODES.INTERNAL_SERVER_ERROR,
    };

    try {
        response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.EmailVerification,
            {
                token: token,
            },
            context,
        );

        loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION);
        logger.info({
            labels,
            ...loggerDefaultParams,
            token: token,
            response,
        });
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION);
        logger.error({
            labels,
            ...loggerDefaultParams,
            token,
            error,
        });

        return helper.sendStatusErrorResponse(res, error.message, error.statusCode);
    }
});

const emailLogin = async (req, res) => {
    const emailLoginRequest = EmailLoginInterface.parse(req[Constants.REQUEST_PAYLOAD.BODY]);
    const context = helper.generateContext();

    let response = {
        message: helper.convertToType<string>(Constants.ERRORS.INTERNAL_SERVER_ERROR, Constants.TYPE_SWITCH.STRING),
        statusCode: Constants.STATUS_CODES.INTERNAL_SERVER_ERROR,
        retryVerification: false,
        token: '',
        name: '',
    };
    const labels = {
        operation: Constants.LOKI_LOGGER_LABELS.LOGIN_REQUEST,
        type: Constants.LOKI_LOGGER_LABELS.EMAIL,
    };
    let loggerDefaultParams = {};

    try {
        response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.EmailLogin,
            emailLoginRequest,
            context,
        );

        if (response.message === Constants.LOGIN_MESSAGE.SUCCESS && response.retryVerification && helper.isNeitherNullNorUndefinedNorEmpty(response.token)) {
            response.message = Constants.AUTH_RESPONSE.RETRY_VERIFICATION;

            const payload = helper.decryptAuthToken(response.token);
            const userInfoForRedisKey = {
                email: emailLoginRequest.userEmailLoginRequest.email,
            };
            const redisKey: string = helper.serialiseRedisKeyValues(
                helper.prepareUserRedisKeyValues(Constants.SERIALISATION_KEYS.USER, userInfoForRedisKey)
            );
            const redisEmailValue: Object = {
                _id: payload._id,
                name: response.name,
                username: payload.username,
            };

            await queueEmployee.addJobToQueue(context.tracerId, labels, Constants.DB.SAVE_IN_REDIS, {
                key: redisKey,
                value: helper.serialiseRedisKeyValues(redisEmailValue),
                timeout: Constants.DB_TIMEOUTS.LONG_CACHE_DB_REDIS_TIMEOUT
            });

            await queueEmployee.addJobToQueue(context.tracerId, labels, Constants.QUEUE_DB.EMAIL_VERIFICATION, {
                token: response.token,
                name: response.name,
                email: emailLoginRequest.userEmailLoginRequest.email
            });
        }

        loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.LOGIN_REQUEST);
        logger.info({
            labels,
            ...loggerDefaultParams,
            emailLoginRequest,
            response,
        });
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.LOGIN_REQUEST);
        logger.error({
            labels,
            ...loggerDefaultParams,
            emailLoginRequest,
            error,
        });

        return helper.sendStatusErrorResponse(res, error.message, error.statusCode);
    }

    return helper.sendStatusSuccessResponse(res, response.statusCode, response);
};

const emailSignUp = async (req, res) => {
    const emailSignUpRequest = EmailSignUpInterface.parse(req[Constants.REQUEST_PAYLOAD.BODY]);
    const context = helper.generateContext();

    let response = {
        message: helper.convertToType<string>(Constants.ERRORS.INTERNAL_SERVER_ERROR, Constants.TYPE_SWITCH.STRING),
        statusCode: Constants.STATUS_CODES.INTERNAL_SERVER_ERROR,
        token: '',
        verified: false,
    };
    const labels = {
        operation: Constants.LOKI_LOGGER_LABELS.SIGNUP_REQUEST,
        type: Constants.LOKI_LOGGER_LABELS.EMAIL,
    }
    let loggerDefaultParams = {};

    try {
        response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.EmailSignUp,
            emailSignUpRequest,
            context,
        );

        if (response.message === Constants.SIGNUP_MESSAGE.CREATED || Constants.SIGNUP_MESSAGE.EXISTING_USER) {
            if (!response.verified && helper.isNeitherNullNorUndefined(response.token)) {
                const payload = helper.decryptAuthToken(response.token);
                const userInfoForRedisKey = {
                    email: emailSignUpRequest.userEmailSignUpRequest.email,
                };
                const redisKey: string = helper.serialiseRedisKeyValues(
                    helper.prepareUserRedisKeyValues(Constants.SERIALISATION_KEYS.USER, userInfoForRedisKey)
                );
                const redisEmailValue: Object = {
                    _id: payload._id,
                    name: emailSignUpRequest.userEmailSignUpRequest.name,
                    username: payload.username,
                    email: payload.email,
                };

                await queueEmployee.addJobToQueue(context.tracerId, labels, Constants.DB.SAVE_IN_REDIS, {
                    key: redisKey,
                    value: helper.serialiseRedisKeyValues(redisEmailValue)
                });

                await queueEmployee.addJobToQueue(context.tracerId, labels, Constants.QUEUE_DB.EMAIL_VERIFICATION, {
                    token: response.token,
                    name: emailSignUpRequest.userEmailSignUpRequest.name,
                    email: emailSignUpRequest.userEmailSignUpRequest.email
                });
            }
        }

        loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.SIGNUP_REQUEST);
        logger.info({
            labels,
            ...loggerDefaultParams,
            emailSignUpRequest,
            response,
        });
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.SIGNUP_REQUEST);
        logger.error({
            labels,
            ...loggerDefaultParams,
            emailSignUpRequest,
            error
        });

        return helper.sendStatusErrorResponse(res, error.message, error.statusCode);
    }

    return helper.sendStatusSuccessResponse(res, response.statusCode, response);
};

const retryEmailVerification = async (req, res) => {
    const { token } = req[Constants.REQUEST_PAYLOAD.HEADERS];
    const context = helper.generateContext();
    const labels = {
        operation: Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION,
        type: Constants.LOKI_LOGGER_LABELS.EMAIL,
    }
    let loggerDefaultParams = {};

    try {
        const payload = helper.decryptAuthToken(token);

        const userInfoForRedisKey = {
            email: payload.email,
        };
        const redisKey: string = helper.serialiseRedisKeyValues(
            helper.prepareUserRedisKeyValues(Constants.SERIALISATION_KEYS.USER, userInfoForRedisKey)
        );

        const isKeyInRedis = await cacheDB.get(redisKey);
        if (helper.isNeitherNullNorUndefinedNorEmpty(isKeyInRedis)) {
            const deSerialisedObject = helper.parseRedisValueToObject(helper.convertToType<string>(isKeyInRedis, Constants.TYPE_SWITCH.STRING));

            await queueEmployee.addJobToQueue(context.tracerId, labels, Constants.QUEUE_DB.EMAIL_VERIFICATION, {
                token: token,
                name: deSerialisedObject.name,
                email: payload.email,
            });

            loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION);
            logger.info({
                labels,
                ...loggerDefaultParams,
                token,
            });
        }
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION);
        logger.error({
            labels,
            ...loggerDefaultParams,
            token,
            error
        });

        return helper.sendStatusErrorResponse(res, error.message, error.statusCode);
    }
};

export {
    router as authenticationRouter
};  
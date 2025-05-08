import { logger } from "../config/loki.js";
import { cacheDB } from "../config/redis.js";
import { clients } from "../config/registery.js";
import { Services } from "../config/services.js";
import { EmailLoginInterface } from "../interface/email_login.js";
import { EmailSignUpInterface } from "../interface/email_signup.js";
import { verifyJwtToken } from "../middlewares/auth.js";
import { Constants } from "../utils/constants.js";
import { helper } from "../utils/helper.js";
import { grpcRequest } from "../utils/grpc.js";
import { EmailVerificationResponse, LoginResponse, PasswordlessAuthenticationResponse, SignUpResponse } from "../utils/response.js";
import { queueEmployee } from "../utils/worker.js";
import { router } from "./router.js";
import { networkHelper } from "../utils/network.js";
import { frontendUrl } from "../config/config.js";
import { PasswordlessAuthenticationInterface } from "../interface/passwordless_authentication.js";

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
        [Constants.AUTH_CHANNELS.PASSWORDLESS]: {
            [Constants.AUTH_PURPOSE.MAGIC_LINK]: magicLinkPasswordless,
        },
    };
    const verifyJwtTokenConfig = [retryEmailVerification];

    try {
        const handler = handlers?.[channel]?.[purpose];
        const handlerName = handlers?.[channel]?.[purpose]?.['name'];

        if (helper.isNeitherNullNorUndefinedNorEmpty(handlerName)) {
            if(verifyJwtTokenConfig.includes(handler)) return verifyJwtToken(req, res, () => handler(req, res))

            return await handler(req, res);
        }
        else {
            return helper.sendStatusErrorResponse(res, Constants.ERRORS.INTERNAL_SERVER_ERROR, Constants.STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
    catch (error) {
        return helper.sendStatusErrorResponse(res, error.message, Constants.STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
});

router.get(`${Constants.ROUTES.EMAIL_VERIFICATION}`, async (req, res) => {
    const token = req.params.id;
    /* Change the title with logo and org */
    if(!networkHelper.checkTokenValidity(token)) {
        res.render(Constants.EJS_PATHS.REDIRECT_EMAIL_VERIFICATION, { frontendUrl, buttonToShow: false, messageToShow: Constants.JWT.INVALID, isError: true });
        return;
    }

    const labels = {
        operation: Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION,
        type: Constants.LOKI_LOGGER_LABELS.EMAIL,
    };
    const context = helper.generateContext();
    const url = `${req.baseUrl}${Constants.ROUTES.EMAIL_VERIFICATION}}`;
    let loggerDefaultParams = {};
    let logPayload = {
        labels,
        url: url,
        token: token,
    };

    if (!token) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION);
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logErrorStack(logPayload, {}, Constants.JWT.MISSING);
        logger.error({ ...logPayload });

        return helper.sendStatusErrorResponse(res, Constants.JWT.MISSING, Constants.STATUS_CODES.NOT_FOUND);
    }

    let response = new EmailVerificationResponse();

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
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logResponse(logPayload, response);
        logger.info({ ...logPayload });
        
        networkHelper.setCookie(res, token);
    }
    catch (error) {
        response.message = Constants.LOGIN_MESSAGE.VERIFICATION_FAILED;

        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION);
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logErrorStack(logPayload, {}, Constants.JWT.MISSING);
        logger.error({ ...logPayload });
    }

    res.render(Constants.EJS_PATHS.REDIRECT_EMAIL_VERIFICATION, { frontendUrl, buttonToShow: response.success, messageToShow: response.message, isError: false });
});

const emailLogin = async (req, res) => {
    if(networkHelper.isUserToBeRedirectedToHome(req)) {
        // redirect to Home
        return;
    }

    const emailLoginRequest = EmailLoginInterface.parse(req[Constants.REQUEST_PAYLOAD.BODY]);
    const context = helper.generateContext();
    const url = `${req.baseUrl}${Constants.ROUTES.LOGIN}`;
    let response = new LoginResponse();

    const labels = {
        operation: Constants.LOKI_LOGGER_LABELS.LOGIN_REQUEST,
        type: Constants.LOKI_LOGGER_LABELS.EMAIL,
    };
    let loggerDefaultParams = {};
    let logPayload = {
        labels,
        url: url,
        emailLoginRequest, 
    };

    try {
        response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.EmailLogin,
            emailLoginRequest,
            context,
        );

        if(response.message === Constants.LOGIN_MESSAGE.SUCCESS && helper.isNeitherNullNorUndefinedNorEmpty(response.token)) {
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

            if(response.retryVerification) {
                await queueEmployee.addJobToQueue(context.tracerId, labels, Constants.QUEUE_DB.EMAIL_VERIFICATION, {
                    token: response.token,
                    name: response.name,
                    email: emailLoginRequest.userEmailLoginRequest.email
                });
            }
            else {
                networkHelper.setCookie(res, response.token);
            }
        }

        loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.LOGIN_REQUEST);
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logResponse(logPayload, response);
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.LOGIN_REQUEST);
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logErrorStack(logPayload, error);
        logger.error({ ...logPayload });

        return helper.sendStatusErrorResponse(res, error.message, error.statusCode);
    }

    logger.info({ ...logPayload });
    return helper.sendStatusSuccessResponse(res, response.statusCode, response);
};

const emailSignUp = async (req, res) => {
    if(networkHelper.isUserToBeRedirectedToHome(req)) {
        // redirect to Home
        return;
    }

    const emailSignUpRequest = EmailSignUpInterface.parse(req[Constants.REQUEST_PAYLOAD.BODY]);
    const context = helper.generateContext();
    const url = `${req.baseUrl}${Constants.ROUTES.SIGNUP}`;
    let response = new SignUpResponse();

    const labels = {
        operation: Constants.LOKI_LOGGER_LABELS.SIGNUP_REQUEST,
        type: Constants.LOKI_LOGGER_LABELS.EMAIL,
    }
    let loggerDefaultParams = {};
    let logPayload = {
        labels,
        url: url,
        emailSignUpRequest, 
    };

    try {
        response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.EmailSignUp,
            emailSignUpRequest,
            context,
        );

        if (response.message === Constants.SIGNUP_MESSAGE.CREATED || Constants.SIGNUP_MESSAGE.EXISTING_USER) {
            if (helper.isNeitherNullNorUndefined(response.token)) {
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
            }

            if(!response.verified) {
                /* Customise data for magic link */
                await queueEmployee.addJobToQueue(context.tracerId, labels, Constants.QUEUE_DB.EMAIL_VERIFICATION, {
                    token: response.token,
                    name: emailSignUpRequest.userEmailSignUpRequest.name,
                    email: emailSignUpRequest.userEmailSignUpRequest.email
                });
            }
        }

        loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.SIGNUP_REQUEST);
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logResponse(logPayload, response);
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.SIGNUP_REQUEST);
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logErrorStack(logPayload, error);
        logger.error({ ...logPayload });

        return helper.sendStatusErrorResponse(res, error.message, error.statusCode);
    }

    logger.info({ ...logPayload });
    return helper.sendStatusSuccessResponse(res, response.statusCode, response);
};

const retryEmailVerification = async (req, res) => {
    const { token } = req[Constants.REQUEST_PAYLOAD.HEADERS];
    const context = helper.generateContext();
    const url = `${req.baseUrl}${Constants.ROUTES.RETRY_EMAIL_VERIFICATION}`;
    const labels = {
        operation: Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION,
        type: Constants.LOKI_LOGGER_LABELS.EMAIL,
    }
    let loggerDefaultParams = {};
    let logPayload = {
        labels,
        url: url,
        token: token,
    };

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
            logPayload = { ...logPayload, ...loggerDefaultParams };
            logPayload = helper.logResponse(logPayload, deSerialisedObject);
        }
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION);
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logErrorStack(logPayload, error);
        logger.error({ ...logPayload });

        return helper.sendStatusErrorResponse(res, error.message, error.statusCode);
    }
    
    logger.info({ ...logPayload });
    return helper.sendStatusSuccessResponse(res, Constants.STATUS_CODES.OK, Constants.LOGIN_MESSAGE.NOT_VERIFIED);
};

const magicLinkPasswordless = async (req, res) => {
    const passwordlessAuthenticationRequest = PasswordlessAuthenticationInterface.parse(req[Constants.REQUEST_PAYLOAD.BODY]);
    const context = helper.generateContext();
    const url = `${req.baseUrl}${Constants.ROUTES.MAGIC_LINK}`;
    let response = new PasswordlessAuthenticationResponse();

    const labels = {
        operation: Constants.LOKI_LOGGER_LABELS.PASSWORDLESS,
        type: Constants.LOKI_LOGGER_LABELS.MAGIC_LINK,
    }
    let loggerDefaultParams = {};
    let logPayload = {
        labels,
        url: url,
        passwordlessAuthenticationRequest, 
    };

    try {   
        response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.PasswordlessAuthentication,
            passwordlessAuthenticationRequest,
            context,
        );

        if(response.statusCode === Constants.STATUS_CODES.OK && response.message === Constants.PASSWORDLESS_AUTHENTICATION_MESSAGE.SUCCESS && helper.isNeitherNullNorUndefinedNorEmpty(response.token)) {
            await queueEmployee.addJobToQueue(context.tracerId, labels, Constants.QUEUE_DB.EMAIL_VERIFICATION, {
                token: response.token,
                email: passwordlessAuthenticationRequest.userPasswordlessAuthenticationRequest.email
            });
        }

        loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.MAGIC_LINK);
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logResponse(logPayload, response);
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.MAGIC_LINK);
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logErrorStack(logPayload, error);
        logger.error({ ...logPayload });

        return helper.sendStatusErrorResponse(res, error.message, error.statusCode);
    }

    logger.info({ ...logPayload });
    return helper.sendStatusSuccessResponse(res, response.statusCode, response);
};

export {
    router as authenticationRouter
};  
import { logger } from "../config/loki.js";
import { cacheDB } from "../config/redis.js";
import { clients } from "../config/registery.js";
import { Services } from "../config/services.js";
import { EmailLoginHTTPRequest } from "../requests/email_login.js";
import { EmailSignUpHTTPRequest } from "../requests/email_signup.js";
import { verifyJwtToken } from "../middlewares/auth.js";
import { Constants } from "../utils/constants.js";
import { helper } from "../utils/helper.js";
import { EmailVerificationResponse, GoogleAuthenticationResponse, LoginResponse, PasswordlessAuthenticationResponse, SignUpResponse } from "../utils/response.js";
import { queueEmployee } from "../utils/worker.js";
import { router } from "./router.js";
import { FRONTEND_ROUTES, networkHelper } from "../utils/network.js";
import { frontendUrl, googleClientId, googleClientSecret, googleRedirectUrl, googleTokenApi, serverUrl } from "../config/config.js";
import { PasswordlessAuthenticationHTTPRequest } from "../requests/passwordless_authentication.js";
import { axios } from "../config/imports.js";
import { GoogleAuthenticationHTTPRequest, RawGoogleAuthenticationHTTPRequest } from "../requests/google_authentication.js";
import { utils } from "../utils/utils.js";
import { grpcProtoRequest } from "./grpc_requests.js";
import { grpcRequest } from "../utils/grpc.js";

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
    let isError: boolean = true;

    /* Change the title with logo and org */
    if(!networkHelper.checkTokenValidity(token)) {
        return res.render(Constants.EJS_PATHS.REDIRECT_EMAIL_VERIFICATION, { frontendUrl, buttonToShow: false, messageToShow: Constants.JWT.INVALID, isError: isError });
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

        return res.render(Constants.EJS_PATHS.REDIRECT_EMAIL_VERIFICATION, { frontendUrl, buttonToShow: false, messageToShow: Constants.JWT.MISSING, isError: true });
    }

    let response = new EmailVerificationResponse();
    const rawSource = helper.decryptAuthToken(token)?.source;
    const source = helper.isNeitherNullNorUndefinedNorEmpty(rawSource) ? rawSource : Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION;

    try {
        response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.EmailVerification,
            {
                token: token,
            },
            context,
        );

        if(response.statusCode === Constants.STATUS_CODES.OK || response.statusCode === Constants.STATUS_CODES.CREATED) {
            const decryptedAuthToken = helper.decryptAuthToken(token);
            if(decryptedAuthToken.source === Constants.AUTH_CHANNELS.PASSWORDLESS) {
                return helper.sendStatusSuccessResponse(res, response.statusCode, response);
            }

            isError = false;

        loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION, source);
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logResponse(logPayload, response);
        logger.info({ ...logPayload });
        
        networkHelper.setCookie(res, token);
    }
        else {
            response.success = false;
        }
    }
    catch (error) {
        response.message = Constants.LOGIN_MESSAGE.VERIFICATION_FAILED;

        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.EMAIL_VERIFICATION, source);
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logErrorStack(logPayload, {}, Constants.JWT.MISSING);
        logger.error({ ...logPayload });
    }

    return res.render(Constants.EJS_PATHS.REDIRECT_EMAIL_VERIFICATION, { frontendUrl, buttonToShow: response.success, messageToShow: response.message, isError: isError });
});

router.get(`${Constants.ROUTES.MAGIC_LINK}/:id`, async (req, res) => {
    const token = req.params.id;

    if(!networkHelper.checkTokenValidity(token)) {
        return res.render(Constants.EJS_PATHS.REDIRECT_EMAIL_VERIFICATION, { frontendUrl, buttonToShow: false, messageToShow: Constants.JWT.INVALID, isError: true });
    }

    networkHelper.setCookie(res, token);
    return res.redirect(FRONTEND_ROUTES.HOME_PAGE);
});

router.get(`${Constants.ROUTES.GOOGLE_INITIATION}`, async (req, res) => {
    const urlToRedirect = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${googleRedirectUrl}&response_type=code&scope=profile email`
    res.redirect(urlToRedirect);
});

router.get(`${Constants.ROUTES.GOOGLE_CALLBACK}`, async (req, res) => {
    const { code } = req.query;
    let response = new GoogleAuthenticationResponse();
    const context = helper.generateContext();
    const labels = {
        operation: Constants.LOKI_LOGGER_LABELS.GOOGLE,
        type: Constants.LOKI_LOGGER_LABELS.GOOGLE_AUTHENTICATION,
    };
    let loggerDefaultParams = {};
    let logPayload: any = {
        labels,
    };

    try {
        const tokenResponse = await axios.post(googleTokenApi!, null, {
            params: {
                code: code,
                client_id: googleClientId,
                client_secret: googleClientSecret,
                redirect_uri: googleRedirectUrl,
                grant_type: Constants.GOOGLE_PATHS.GRANT_TYPE
            },
            headers: {
                [Constants.GOOGLE_PATHS.CONTENT_TYPE]: Constants.GOOGLE_PATHS.ENCODED_CONTENT_TYPE,
            }
        });

        const { access_token } = tokenResponse.data;

        const userData: any = await axios.get(Constants.GOOGLE_PATHS.USER_INFO_URL, {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const rawGoogleAuthenticationRequest = RawGoogleAuthenticationHTTPRequest.parse(utils.rawGoogleAuthenticationRequest(userData?.data));
        if(rawGoogleAuthenticationRequest && rawGoogleAuthenticationRequest?.verifiedEmail !== true) {
            throw new Error(Constants.GOOGLE_AUTHENTICATION_MESSAGE.NOT_VERIFIED);
        }

        const userDeviceInformation = utils.parseDeviceInfo(req);
        const googleAuthenticationRequest = grpcProtoRequest.googleAuthenticationRequest(rawGoogleAuthenticationRequest, userDeviceInformation);
        const url = `${req.baseUrl}${Constants.ROUTES.GOOGLE_CALLBACK}`;

        logPayload.url = url;
        logPayload = { ...logPayload, ...googleAuthenticationRequest };

        response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.GoogleAuthentication,
            googleAuthenticationRequest,
            context,
        );

        if(response.statusCode === Constants.STATUS_CODES.OK || response.statusCode === Constants.STATUS_CODES.CREATED) {
            networkHelper.setCookie(res, response.token);

            loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.LOGIN_REQUEST);
            logPayload = { ...logPayload, ...loggerDefaultParams };
            logPayload = helper.logResponse(logPayload, response);
            logger.info({ ...logPayload });

            res.redirect(FRONTEND_ROUTES.HOME_PAGE);
        }        
        else {
            res.redirect(FRONTEND_ROUTES.SIGNUP_PAGE); /* Show custom error on page */
        }
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId, Constants.LOKI_LOGGER_LABELS.LOGIN_REQUEST);
        logPayload = { ...logPayload, ...loggerDefaultParams };
        logPayload = helper.logErrorStack(logPayload, error);
        logger.error({ ...logPayload });

        res.redirect(FRONTEND_ROUTES.SIGNUP_PAGE); /* Show custom error on page */
    }
});

const emailLogin = async (req, res) => {
    if(networkHelper.isUserToBeRedirectedToHome(req)) {
        networkHelper.setCookie(res, req.cookies.jwt_access_token);
        return res.redirect(FRONTEND_ROUTES.HOME_PAGE);
    }

    const rawEmailLoginRequest = EmailLoginHTTPRequest.parse(req[Constants.REQUEST_PAYLOAD.BODY]);
    const userDeviceInformation = utils.parseDeviceInfo(req);
    const emailLoginRequest = grpcProtoRequest.emailLoginRequest(rawEmailLoginRequest, userDeviceInformation);

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
        networkHelper.setCookie(res, req.cookies.jwt_access_token);
        return res.redirect(FRONTEND_ROUTES.HOME_PAGE);
    }

    const rawEmailSignUpRequest = EmailSignUpHTTPRequest.parse(req[Constants.REQUEST_PAYLOAD.BODY]);
    const userDeviceInformation = utils.parseDeviceInfo(req);
    const emailSignUpRequest = grpcProtoRequest.emailSignUpRequest(rawEmailSignUpRequest, userDeviceInformation);

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
            if(!response.verified) {
                /* Customise data for magic link */
                await queueEmployee.addJobToQueue(context.tracerId, labels, Constants.QUEUE_DB.EMAIL_VERIFICATION, {
                    token: response.token,
                    name: emailSignUpRequest.userEmailSignUpRequest.name,
                    email: emailSignUpRequest.userEmailSignUpRequest.email
                });
            }
                networkHelper.setCookie(res, response.token);
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
    /* if(networkHelper.isUserToBeRedirectedToHome(req)) {
        networkHelper.setCookie(res, req.cookies[Constants.REQUEST_HEADERS.TOKEN]);
        return res.redirect(FRONTEND_ROUTES.HOME_PAGE);
    } */

    const rawPasswordlessAuthenticationRequest = PasswordlessAuthenticationHTTPRequest.parse(req[Constants.REQUEST_PAYLOAD.BODY]);
    const userDeviceInformation = utils.parseDeviceInfo(req);
    const passwordlessAuthenticationRequest = grpcProtoRequest.passwordlessAuthenticationRequest(rawPasswordlessAuthenticationRequest, userDeviceInformation);

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
            await queueEmployee.addJobToQueue(context.tracerId, labels, Constants.QUEUE_DB.PASSWORDLESS, {
                token: response.token,
                email: passwordlessAuthenticationRequest.userPasswordlessAuthenticationRequest.email,
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
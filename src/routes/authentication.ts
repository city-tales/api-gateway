import { logger } from "../config/loki.js";
import { clients } from "../config/registery.js";
import { Services } from "../config/services.js";
import { EmailLoginInterface } from "../interface/email_login.js";
import { EmailSignUpInterface } from "../interface/email_signup.js";
import { Constants } from "../utils/constants.js";
import { helper } from "../utils/helper.js";
import { grpcRequest } from "../utils/network.js";
import { router } from "./router.js";

router.post("/", async (req, res) => {
    const { channel, purpose } = req[Constants.REQUEST_PAYLOAD.HEADERS];
    if (helper.isArrayEitherNullOrUndefinedOrEmpty([channel, purpose]))
        return helper.sendStatusErrorResponse(res, Constants.ERRORS.BAD_REQUEST, Constants.STATUS_CODES.BAD_REQUEST);

    const handlers = {
        [Constants.AUTH_CHANNELS.EMAIL]: {
            [Constants.AUTH_PURPOSE.LOGIN]: emailLogin,
            [Constants.AUTH_PURPOSE.SIGNUP]: emailSignUp,
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
        return helper.sendStatusErrorResponse(res, error.message, Constants.STATUS_CODES.BAD_REQUEST);
    }
});

const emailLogin = async (req, res) => {
    const emailLoginRequest = EmailLoginInterface.parse(req[Constants.REQUEST_PAYLOAD.BODY]);
    const context = helper.generateContext();

    let response = {
        message: helper.convertToType<string>(Constants.ERRORS.INTERNAL_SERVER_ERROR),
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

        if (response.message === Constants.LOGIN_MESSAGE.SUCCESS && response.retryVerification) {
            response.message = Constants.AUTH_RESPONSE.RETRY_VERIFICATION;
            await helper.sendEmailForVerification(context.tracerId, {
                token: response.token,
                user: {
                    name: response.name,
                    email: emailLoginRequest.userEmailLoginRequest.email
                },
                subject: Constants.NODE_MAILER_MESSAGE.SUBJECT,
                encoding: Constants.NODE_MAILER_MESSAGE.ENCODING,
                filePath: Constants.EJS_PATHS.EMAIl_VERIFY,
            }, labels);
        }

        loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId);
        logger.info({
            labels,
            ...loggerDefaultParams,
            emailLoginRequest,
            response,
        });
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId);
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
        message: helper.convertToType<string>(Constants.ERRORS.INTERNAL_SERVER_ERROR),
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

        if (response.message === Constants.SIGNUP_MESSAGE.CREATED) {
            if (!response.verified) {
                await helper.sendEmailForVerification(context.tracerId, {
                    token: response.token,
                    user: {
                        name: emailSignUpRequest.userEmailSignUpRequest.name,
                        email: emailSignUpRequest.userEmailSignUpRequest.email
                    },
                    subject: Constants.NODE_MAILER_MESSAGE.SUBJECT,
                    encoding: Constants.NODE_MAILER_MESSAGE.ENCODING,
                    filePath: Constants.EJS_PATHS.EMAIl_VERIFY,
                }, labels);
            }
        }

        loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId);
        logger.info({
            labels,
            ...loggerDefaultParams,
            emailSignUpRequest,
            response,
        });
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId);
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

export {
    router as authenticationRouter
};  
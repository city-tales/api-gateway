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
    if(helper.isArrayEitherNullOrUndefinedOrEmpty([channel, purpose])) 
        return helper.sendStatusErrorResponse(res, Constants.STATUS_CODES.BAD_REQUEST,  Constants.ERRORS.BAD_REQUEST);

    const handlers = {
        [Constants.AUTH_CHANNELS.EMAIL]: {
            [Constants.AUTH_PURPOSE.LOGIN]: emailLogin,
            [Constants.AUTH_PURPOSE.SIGNUP]: emailSignUp,
        },
    };

    try {
        const handler = handlers?.[channel]?.[purpose];

        if(helper.isNeitherNullNorUndefinedNorEmpty(handler))
            return await handler(req, res);
        else 
            return helper.sendStatusErrorResponse(res, Constants.STATUS_CODES.INTERNAL_SERVER_ERROR, Constants.ERRORS.INTERNAL_SERVER_ERROR);
    }
    catch (error) {
        return helper.sendStatusErrorResponse(res, Constants.STATUS_CODES.BAD_REQUEST,  error.message);
    }
});

const emailLogin = async (req, res) => {
    const emailLoginRequest = EmailLoginInterface.parse(req[Constants.REQUEST_PAYLOAD.BODY]);
    const context = helper.generateContext();

    let response = {
        message: helper.convertToType<string>(Constants.ERRORS.INTERNAL_SERVER_ERROR),
        statusCode: helper.convertToType<number>(Constants.STATUS_CODES.INTERNAL_SERVER_ERROR),
        retryVerification: false,
        token: '',
        verified: false,
    };
    let loggerDefaultParams = {};

    try {
        response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.EmailLogin,
            emailLoginRequest,
            context,
        );

        if(response.retryVerification) {
            response.message = Constants.AUTH_RESPONSE.RETRY_VERIFICATION;
            response.verified = false;
        }

        loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId);
        logger.info(Constants.LOKI_LOGGER_LABELS.REQUEST_TYPE, {
            labels: {
                operation: Constants.LOKI_LOGGER_LABELS.LOGIN_REQUEST,
                type: Constants.LOKI_LOGGER_LABELS.EMAIL,
            },
            loggerDefaultParams,
            emailLoginRequest,
            response,
        });
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId);
        logger.error(Constants.LOKI_LOGGER_LABELS.REQUEST_TYPE, {
            labels: {
                operation: Constants.LOKI_LOGGER_LABELS.LOGIN_REQUEST,
                type: Constants.LOKI_LOGGER_LABELS.EMAIL,
            },
            loggerDefaultParams,
            emailLoginRequest,
            error,
        });

        return helper.sendStatusErrorResponse(res, error.statusCode, error.message);
    }

    return helper.sendStatusSuccessResponse(res, response.statusCode, response);
};

const emailSignUp = async (req, res) => {
    const emailSignUpRequest = EmailSignUpInterface.parse(req[Constants.REQUEST_PAYLOAD.BODY]);
    const context = helper.generateContext();

    let response = {
        message: helper.convertToType<string>(Constants.ERRORS.INTERNAL_SERVER_ERROR),
        statusCode: helper.convertToType<number>(Constants.STATUS_CODES.INTERNAL_SERVER_ERROR),
        token: '',
    };
    let loggerDefaultParams = {};

    try {
        response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.EmailSignUp,
            emailSignUpRequest,
            context,
        );  

        loggerDefaultParams = helper.generateDefaultSuccessParams(context.tracerId);
        logger.info(Constants.LOKI_LOGGER_LABELS.REQUEST_TYPE, {
            labels: {
                operation: Constants.LOKI_LOGGER_LABELS.SIGNUP_REQUEST,
                type: Constants.LOKI_LOGGER_LABELS.EMAIL,
            },
            loggerDefaultParams,
            emailSignUpRequest,
            response,
        });
    }
    catch (error) {
        loggerDefaultParams = helper.generateDefaultFailureParams(context.tracerId);
        logger.error(Constants.LOKI_LOGGER_LABELS.REQUEST_TYPE, {
            labels: {
                operation: Constants.LOKI_LOGGER_LABELS.SIGNUP_REQUEST,
                type: Constants.LOKI_LOGGER_LABELS.EMAIL,
            },
            loggerDefaultParams,
            emailSignUpRequest,
            error
        });

        return helper.sendStatusErrorResponse(res, error.statusCode, error.message);
    }

    return helper.sendStatusSuccessResponse(res, response.statusCode, response);
};

export { 
    router as authenticationRouter
};  
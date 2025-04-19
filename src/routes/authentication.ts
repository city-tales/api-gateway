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
    let response = {
        message: helper.convertToType<string>(Constants.ERRORS.INTERNAL_SERVER_ERROR),
        statusCode: helper.convertToType<number>(Constants.STATUS_CODES.INTERNAL_SERVER_ERROR),
        retryVerification: false,
        token: '',
        verified: false,
    };

    try {
        response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.EmailLogin,
            emailLoginRequest
        );

        if(response.retryVerification) {
            // retry verification --> show a diloag box for email verification in homepage
            response.message = Constants.AUTH_RESPONSE.RETRY_VERIFICATION;
            response.verified = false;
        }
    }
    catch (error) {
        // log response
        response.message = error.message;
    }

    return helper.sendStatusSuccessResponse(res, response.statusCode, response);
};

const emailSignUp = async (req, res) => {
    const emailSignUpRequest: EmailSignUpInterface = req[Constants.REQUEST_PAYLOAD.BODY];
    try {
        const response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.EmailSignUp,
            emailSignUpRequest
        );

        console.log(response);
    }
    catch (error) {
        return helper.sendStatusSuccessResponse(res, Constants.STATUS_CODES.INTERNAL_SERVER_ERROR, {});
    }

    return helper.sendStatusSuccessResponse(res, Constants.STATUS_CODES.ACCEPTED, {});
};

export { 
    router as authenticationRouter
};  
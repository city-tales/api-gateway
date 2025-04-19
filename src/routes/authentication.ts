import { clients } from "../config/registery.js";
import { Services } from "../config/services.js";
import { EmailSignUpInterface } from "../interface/email_signup.js";
import { Constants } from "../utils/constants.js";
import { helper } from "../utils/helper.js";
import { grpcRequest } from "../utils/network.js";
import { router } from "./router.js";

router.post("/", async (req, res) => {
    const { channel, purpose } = req["headers"];
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

const emailLogin = (req, res) => {
    console.log("Email Login");

    return helper.sendStatusResponse(res, Constants.STATUS_CODES.ACCEPTED, "Login !!");
};

const emailSignUp = async (req, res) => {
    const emailSignUpRequest : EmailSignUpInterface = req["body"];
    try {
        const response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.EmailSignUp,
            emailSignUpRequest
        );

        console.log(response);
    }
    catch (error) {
        return helper.sendStatusResponse(res, Constants.STATUS_CODES.INTERNAL_SERVER_ERROR, Constants.ERRORS.INTERNAL_SERVER_ERROR);
    }

    return helper.sendStatusResponse(res, Constants.STATUS_CODES.ACCEPTED, "Signup !!");
};

export { 
    router as authenticationRouter
};  
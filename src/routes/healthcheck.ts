import { logger } from "../config/loki.js";
import { clients } from "../config/registery.js";
import { Services } from "../config/services.js";
import { Constants } from "../utils/constants.js";
import { grpcRequest } from "../utils/grpc.js";
import { helper } from "../utils/helper.js";
import { HealthCheckResponse } from "../utils/response.js";
import { router } from "./router.js";

router.post(`${Constants.ROUTES.HOME}`, async (req, res) => {
    const { channel, purpose } = req[Constants.REQUEST_PAYLOAD.HEADERS];
    if (helper.isArrayEitherNullOrUndefinedOrEmpty([channel, purpose]))
        return helper.sendStatusErrorResponse(res, Constants.ERRORS.BAD_REQUEST, Constants.STATUS_CODES.BAD_REQUEST);

    const handlers = {
        [Constants.AUTH_CHANNELS.HEALTHCHECK]: {
            [Constants.AUTH_PURPOSE.HEALTHCHECK]: healthCheck,
        }
    };

    try {
        const handler = handlers?.[channel]?.[purpose];
        const handlerName = handlers?.[channel]?.[purpose]?.['name'];

        if (helper.isNeitherNullNorUndefinedNorEmpty(handlerName)) {
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

const healthCheck = async (req, res) => {
    const healthCheckRequest = {
        service: `${Constants.SERVICES.AUTHENTICATION}`
    }
    const context = helper.generateContext();
    const url = `${req.baseUrl}${Constants.ROUTES.HEALTHCHECK}`;
    let response = new HealthCheckResponse();

    const labels = {
        operation: Constants.LOKI_LOGGER_LABELS.HEALTHCHECK,
        type: Constants.LOKI_LOGGER_LABELS.HEALTHCHECK,
    };
    let loggerDefaultParams = {};
    let logPayload = {
        labels,
        url: url,
        healthCheckRequest,
    };

    try {
        response = await grpcRequest(
            clients[Services.RpcRequest.AuthRpcRequest],
            Services.AuthRpcServices.HealthCheck,
            healthCheckRequest,
            context,
        );

        if (!helper.isGenericNeitherNullNorUndefinedNorInvalid(response.statusCode)) {
            throw new Error(response.message);   
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

export {
    router as healthCheckRouter
};  
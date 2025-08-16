import { Constants } from "../utils/constants.js";
import { helper } from "../utils/helper.js";
import { lokiLoggerUrl, lokiLoggerUser, lokiLoggerToken } from "./config.js";
import { createLogger, LokiTransport, winston } from "./imports.js";

const options = {
    transports: [
        new LokiTransport({
            host: `${lokiLoggerUrl}`,
            labels: { 
                application: Constants.LOKI_LOGGER.APPLICATION,
                environment: helper.convertToType<boolean>(Constants.DEMO_SWITCH.LOKI_LOGGER, Constants.TYPE_SWITCH.BOOLEAN) ? Constants.LOKI_LOGGER.DEMOENV : Constants.LOKI_LOGGER.PRODENV,
            }, // default labels
            json: true,
            basicAuth: `${lokiLoggerUser}:${lokiLoggerToken}`,
            format: winston.format.json(),
            replaceTimestamp: true,
            onConnectionError: (error) => console.error(error),
        }),
    ]
};

export const logger = createLogger(options);
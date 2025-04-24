import { Constants } from "../utils/constants.js";
import { lokiLoggerUrl, lokiLoggerUser, lokiLoggerToken } from "./config.js";
import { createLogger, LokiTransport, winston } from "./imports.js";

const options = {
    transports: [
        new LokiTransport({
            host: lokiLoggerUrl!,
            labels: { 
                app: Constants.LOKI_LOGGER.APPLICATION,
                env: Constants.LOKI_LOGGER.DEMOENV, // For local environment
                // env: Constants.LOKI_LOGGER.PRODENV, // For prod environment
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
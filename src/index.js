import 'dotenv/config';
import "./config/init_connections.js";

import { port } from "./config/config.js";
import { server } from "./config/server.js";
import { authenticationRouter } from "./routes/authentication.js";
import { healthCheckRouter } from "./routes/healthcheck.js";
import { Constants } from './utils/constants.js';

server.use(`${Constants.ROUTES.AUTHENTICATION}`, authenticationRouter);
server.use(`${Constants.ROUTES.HEALTHCHECK}`, healthCheckRouter);

server.get('/', (req, res) => {
    res.status(200).json({
        message: `API Gateway running on port ${port}`
    })
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
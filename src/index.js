import { server } from "./config/server.js";
import { port } from "./config/config.js";
import { authenticationRouter } from "./routes/authentication.js";

server.use("/api/authentication", authenticationRouter);



server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
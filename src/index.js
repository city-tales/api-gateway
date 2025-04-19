import { server } from "./config/server.js";
import { PORT } from "./config/config.js";
import { authenticationRouter } from "./routes/authentication.js";

server.use("/api/authentication", authenticationRouter);



server.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
import { cors, express, path, server, fileURLToPath } from "./imports.js";
import { Constants } from "../utils/constants.js";
import { queueEmployee } from "../utils/worker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename), '..');

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(
    cors({
        origin: "*",
        methods: [Constants.REQUEST_METHODS.POST, Constants.REQUEST_METHODS.GET, Constants.REQUEST_METHODS.PUT, 
            Constants.REQUEST_METHODS.PATCH, Constants.REQUEST_METHODS.HEAD, Constants.REQUEST_METHODS.OPTIONS ],
        allowedHeaders: [Constants.REQUEST_HEADERS.CONTENT_TYPE, Constants.REQUEST_HEADERS.AUTHORIZATION ],
    })
);

server.set("views", path.join(__dirname, "../views"));
server.set("view engine", "ejs");

server.use((err, req, res, next) => {

    if (req.method === Constants.REQUEST_METHODS.OPTIONS) {
        res.sendStatus(Constants.STATUS_CODES.NO_CONTENT);
        return;
    }

    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    next();
});

export {
    server,
    __dirname,
    __filename
};
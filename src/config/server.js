import { cors, express, path, server, fileURLToPath, cookieParser } from "./imports.js";
import { Constants } from "../utils/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename), '..');

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

server.use(
    cors({
        origin: "http://127.0.0.1:5500",
        credentials: true,
        methods: [Constants.REQUEST_METHODS.POST, Constants.REQUEST_METHODS.GET, Constants.REQUEST_METHODS.PUT, 
            Constants.REQUEST_METHODS.PATCH, Constants.REQUEST_METHODS.HEAD, Constants.REQUEST_METHODS.OPTIONS ],
        allowedHeaders: [Constants.REQUEST_HEADERS.CONTENT_TYPE, Constants.REQUEST_HEADERS.AUTHORIZATION ],
    })
);

server.set("views", path.join(__dirname, "views"));
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
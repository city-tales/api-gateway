import { helper } from "../utils/helper.js";
import { Constants } from "../utils/constants.js";
import { jwt } from "../config/imports.js";
import { jwtPublicKey } from "../config/config.js";

export const verifyJwtToken = (req, res, next) => {
    const { token } = req[Constants.REQUEST_PAYLOAD.HEADERS];
    const rawTokenInCookie = req.cookies[Constants.REQUEST_HEADERS.TOKEN];
    const sanitisedToken = rawTokenInCookie?.startsWith('s:') ? rawTokenInCookie.slice(2) : rawTokenInCookie;

    if(helper.isEitherNullOrUndefinedOrEmpty(token) && helper.isEitherNullOrUndefinedOrEmpty(rawTokenInCookie)) {
        return helper.sendStatusErrorResponse(res, Constants.JWT.EMPTY, Constants.STATUS_CODES.UNAUTHORIZED);
    }

    try {
        let isValidToken;
        if(sanitisedToken) isValidToken = jwt.verify(sanitisedToken, jwtPublicKey);
        else isValidToken = jwt.verify(token, jwtPublicKey);

        next();
    }
    catch(error) {
        return helper.sendStatusErrorResponse(res, (
            helper.isNeitherNullNorUndefinedNorEmpty(error.message) ? error.message : Constants.JWT.INVALID
        ), Constants.STATUS_CODES.NOT_FOUND);
    }
}

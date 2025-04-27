import { helper } from "../utils/helper.js";
import { Constants } from "../utils/constants.js";
import { jwt } from "../config/imports.js";
import { jwtPublicKey } from "../config/config.js";

export const verifyJwtToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if(helper.isEitherNullOrUndefinedOrEmpty(token)) {
        return helper.sendStatusErrorResponse(res, Constants.JWT.EMPTY, Constants.STATUS_CODES.UNAUTHORIZED);
    }

    try {
        const isValidToken = jwt.verify(token, jwtPublicKey);
        next();
    }
    catch(error) {
        return helper.sendStatusErrorResponse(res, Constants.JWT.INVALID, Constants.STATUS_CODES.NOT_FOUND);
    }
}

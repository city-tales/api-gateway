import { helper } from "../utils/helper.js";
import { Constants } from "../utils/constants.js";
import { jwt } from "../config/imports.js";
import { JWT_PUBLIC_KEY } from "../config/config.js";

export const verifyJwtToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if(helper.isEitherNullOrUndefinedOrEmpty(token)) {
        return helper.sendStatusResponse(res, Constants.STATUS_CODES.UNAUTHORIZED, Constants.JWT.EMPTY);
    }

    try {
        const isValidToken = jwt.verify(token, JWT_PUBLIC_KEY);
        next();
    }
    catch(error) {
        return helper.sendStatusResponse(res, Constants.STATUS_CODES.NOT_FOUND, Constants.JWT.INVALID);
    }
}

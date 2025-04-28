import { jwtPublicKey } from "../config/config.js";
import { jwt } from "../config/imports.js";
import { Constants } from "./constants.js";
import { helper } from "./helper.js";

interface NetworkHelper {
    setCookie(res: any, token: string, tokenAge?: number);
    checkTokenValidity(token: string): boolean;
    isUserToBeRedirectedToHome(req: any): boolean;
}

class NetworkHelperImpl implements NetworkHelper {
    setCookie(res: any, token: string, tokenAge?: number) {
        const cookieValue = `token=${token}; ${Constants.NETWORK_CONFIG.HTTP_ONLY}; ${Constants.NETWORK_CONFIG.SECURE}; ${Constants.NETWORK_CONFIG.SAME_SITE}; Max-Age=${tokenAge ?? Constants.NETWORK_CONFIG.DEFAULT_TOKEN_AGE}; ${Constants.NETWORK_CONFIG.PATH}`;
        res.setHeader(Constants.NETWORK_CONFIG.SET_COOKIE, cookieValue);
    }

    checkTokenValidity(token: string): boolean {
        try {
            jwt.verify(token, jwtPublicKey);  
            return true;
        } catch (error) {
            return false;
        }
    }

    isUserToBeRedirectedToHome(req: any): boolean {
        try {
            const rawTokenInCookie = req.cookies.jwt_access_token;
            const sanitisedToken = rawTokenInCookie?.startsWith('s:') ? rawTokenInCookie.slice(2) : rawTokenInCookie;
            if(helper.isNeitherNullNorUndefinedNorEmpty(sanitisedToken) && this.checkTokenValidity(sanitisedToken)) return true;
        }
        catch (error) {}
        return false;
    }
}   

export const networkHelper = new NetworkHelperImpl();
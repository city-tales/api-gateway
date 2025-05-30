import { frontendUrl, jwtPrivateKey, jwtPublicKey } from "../config/config.js";
import { jwt } from "../config/imports.js";
import { Constants } from "./constants.js";
import { helper } from "./helper.js";

export const FRONTEND_ROUTES = {
    LOGIN_PAGE: `${frontendUrl}/login`,
    SIGNUP_PAGE: `${frontendUrl}/signup`,
    HOME_PAGE: `${frontendUrl}/home`,
};

interface NetworkHelper {
    setCookie(res: any, token: string, tokenAge?: number);
    setRefreshTokenCookie(res: any, token: string, tokenAge?: number);
    checkTokenValidity(token: string): boolean;
    generateUserAuthToken(_id: string, username: string, email: string, label: string, isVerified?: boolean): string;
    isUserToBeRedirectedToHome(req: any, res: any): boolean;
}

class NetworkHelperImpl implements NetworkHelper {
    setCookie(res: any, token: string, tokenAge?: number) {
        const cookieValue = `token=${token}; ${Constants.NETWORK_CONFIG.HTTP_ONLY}; ${Constants.NETWORK_CONFIG.SECURE}; ${Constants.NETWORK_CONFIG.SAME_SITE}; Max-Age=${tokenAge ?? Constants.NETWORK_CONFIG.DEFAULT_TOKEN_AGE}; ${Constants.NETWORK_CONFIG.PATH}`;
        res.setHeader(Constants.NETWORK_CONFIG.SET_COOKIE, cookieValue);
    }

    setRefreshTokenCookie(res: any, token: string, tokenAge?: number) {
        const cookieValue = `refresh-token=${token}; ${Constants.NETWORK_CONFIG.HTTP_ONLY}; ${Constants.NETWORK_CONFIG.SECURE}; ${Constants.NETWORK_CONFIG.SAME_SITE}; Max-Age=${tokenAge ?? Constants.NETWORK_CONFIG.DEFAULT_TOKEN_AGE}; ${Constants.NETWORK_CONFIG.PATH}`;
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

    generateUserAuthToken(_id: string, username: string, email: string, label: string, isVerified?: boolean): string {
        const payload = {
            _id: _id,
            username: username,
            email: email,
            source: label,
            isVerified: helper.isGenericNeitherNullNorUndefined(isVerified) && isVerified ? true : false,
        };

        const token: string = jwt.sign(payload, jwtPrivateKey, {
            algorithm: Constants.JWT_CONFIG.ALGORITHM,
            expiresIn: Constants.JWT_CONFIG.VERY_SHORT_LIVED
        });

        return token;
    }

    isUserToBeRedirectedToHome(req: any, res: any): boolean {
        try {
            const rawTokenInCookie = req.cookies[Constants.REQUEST_HEADERS.TOKEN] ?? null;
            const sanitisedToken = rawTokenInCookie?.startsWith('s:') ? rawTokenInCookie.slice(2) : rawTokenInCookie;
            if(helper.isNeitherNullNorUndefinedNorEmpty(sanitisedToken)) {
                if(this.checkTokenValidity(sanitisedToken)) {
                    const decryptAuthToken = helper.decryptAuthToken(sanitisedToken);
                    return decryptAuthToken.isVerified;
                }
                else {
                    const rawRefreshTokenInCookie = req.cookies[Constants.REQUEST_HEADERS.REFRESH_TOKEN] ?? null;
                    const sanitisedRefreshToken = rawRefreshTokenInCookie?.startsWith('s:') ? rawRefreshTokenInCookie.slice(2) : rawRefreshTokenInCookie;

                    if(this.checkTokenValidity(sanitisedRefreshToken)) {
                        const decryptRefreshAuthToken = helper.decryptAuthToken(sanitisedRefreshToken);
                        const generateNewToken = this.generateUserAuthToken(decryptRefreshAuthToken._id, decryptRefreshAuthToken.username, decryptRefreshAuthToken.email, Constants.LOKI_LOGGER_LABELS.REFRESH_TOKEN, true);

                        this.setCookie(res, generateNewToken);
                        return true;
                    }
                }
            }
        }
        catch (error) {}
        return false;
    }
}   

export const networkHelper = new NetworkHelperImpl();   
import { StringOrNull } from "./custom_types.js";
import { DeviceType } from "./types.js";

interface Utils {
    parseDeviceInfo(req: any): DeviceType;
    rawGoogleAuthenticationRequest(payload: any);
    prepareGoogleAuthenticationRequest(userDeviceInformation: DeviceType, rawGoogleAuthenticationRequest: any);
}

class UtilsImpl implements Utils {
    parseDeviceInfo(req: any): DeviceType {
        const headers = req.headers;
        const ua = headers['user-agent'] || '';
        const chUa = headers['sec-ch-ua'] || '';
        const chUaPlatform = headers['sec-ch-ua-platform'] || '';
        const now = new Date().toISOString();

        let browser = 'Unknown';
        if (ua.includes('Chrome/')) browser = 'Chrome';
        else if (ua.includes('Safari/') && ua.includes('Macintosh')) browser = 'Safari';
        else if (ua.includes('Firefox/')) browser = 'Firefox';

        let browserVersion = '';
        const chromeMatch = ua.match(/Chrome\/([\d\.]+)/);
        if (chromeMatch) browserVersion = chromeMatch[1];

        let platform = 'Unknown';
        if (chUaPlatform) {
            platform = chUaPlatform.replace(/"/g, '');
        } else if (ua.includes('Macintosh')) {
            platform = 'macOS';
        } else if (ua.includes('Windows')) {
            platform = 'Windows';
        } else if (ua.includes('Linux')) {
            platform = 'Linux';
        }

        let deviceType = 'Desktop';
        if (/mobile/i.test(ua)) deviceType = 'Mobile';
        else if (/tablet/i.test(ua)) deviceType = 'Tablet';

        // Device name - we can't really know, so guess from browser/OS
        const deviceName = platform + ' ' + browser;

        // Device ID - we can't know, unless you assign one (see note above)
        const deviceId = uuidv4();

        return {
            deviceType: deviceType,
            browserInfo: `${browser} ${browserVersion}`.trim(),
            ipAddress: req.ip || req.connection.remoteAddress || '',
            deviceId: deviceId,
            platform: platform,
            deviceName: deviceName,
            loginTime: now,
        };
    }

    rawGoogleAuthenticationRequest(payload: any) {
        return {
            email: payload?.email,
            firstName: payload?.given_name,
            lastName: payload?.family_name,
            name: payload?.name,
            profilePicture: payload?.picture,
            verifiedEmail: payload?.verified_email,
        }
    }
    
    prepareGoogleAuthenticationRequest(userDeviceInformation: DeviceType, rawGoogleAuthenticationRequest: any) {
        return {
            userDeviceInformation: userDeviceInformation,
            userGoogleAuthenticationRequest: rawGoogleAuthenticationRequest,
        }
    }
}

export const utils = new UtilsImpl();


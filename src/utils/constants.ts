import { serverUrl } from "../config/config.js";

enum DEV_CONTROLLER {
    SWTICH_OFF_REDIS = 'false'
};

enum DEMO_SWITCH {
    LOKI_LOGGER = 'true',
};

enum DB {
    SAVE_IN_REDIS = 'saveInRedis',
}

enum QUEUE_DB {
    MAX_ATTEMPTS = 3,
    BACKOFF_EXPONENTIAL = 'exponential',
    STALLED_TIMEOUT_INTERVAL = 300000,
    GUARD_TIMEOUT_INTERVAL = 5000,
    DRAIN_DELAY_TIMEOUT = 300,
    BACKOFF_DELAY = 5000,
    JOB_TIMEOUT = 10000,
    LOCK_DURATION = 30000,
    CONCURRENCY = 5,
    EMAIL_VERIFICATION = 'emailVerification',
    PASSWORDLESS = 'passwordless',
};

enum DB_TIMEOUTS {
    CONNECTION_TIMEOUT = 10000,
    QUERY_TIMEOUT = 10000,
    LOCK_TIMEOUT = 10000,
    IDLE_TIMEOUT = 10000,
    CACHE_DB_REDIS_TIMEOUT = 600,
    VERY_SHORT_CACHE_DB_REDIS_TIMEOUT = 300,
    SHORT_CACHE_DB_REDIS_TIMEOUT = 3600,
    LONG_CACHE_DB_REDIS_TIMEOUT = 86400,
};

enum LOKI_LOGGER {
    TARGET = 'winston-loki',
    APPLICATION = 'api-gateway',
    DEMOENV = 'demo',
    PRODENV = 'prod',
};

enum LOKI_LOGGER_LABELS {
    ADD_JOB_TO_QUEUE = 'addJobToQueue',
    JOB_ADDED = 'jobAddedToQueue',
    REGISTER_JOB = 'registerWorker',
    REGISTER_REDIS_WORKER = DB.SAVE_IN_REDIS,
    PERFORM_JOB = 'jobInAction',
    FAILED_JOB = 'jobFailed',

    REQUEST_TYPE = 'https',
    SIGNUP_REQUEST = 'signupRequest',
    LOGIN_REQUEST = 'loginRequest',
    EMAIL_VERIFICATION = 'emailVerification',
    MAGIC_LINK = 'magicLink',

    EMAIL = 'email',
    GOOGLE = 'google',
    PASSWORDLESS = 'passwordless',

    QUEUE = 'queue',
    WORKER = 'worker',
    CACHE_DB = 'cache-db',
    QUEUE_DB = 'queue-db'
};

enum SERIALISATION_KEYS {
    USER = 'USER',
    DEVICE = 'DEVICE',
    EMAIL = 'EMAIL',
    COUNTRY_CODE = 'COUNTRY_CODE',
    PHONE_NUMBER = 'PHONE_NUMBER',
};

enum ROUTES {
    HOME = '/',
    AUTHENTICATION = '/api/authentication',
    SIGNUP = '/email/register',
    LOGIN = '/email/login',
    RETRY_EMAIL_VERIFICATION = '/email/retryverification',
    EMAIL_VERIFICATION = '/verify/:id',
    MAGIC_LINK = '/passwordless/magiclink',
    PASSWORDLESS = '/:id',
}

export const URL = {
    SIGNUP_REQUEST: `${serverUrl}${ROUTES.AUTHENTICATION}`,
}

enum AUTH_CHANNELS {
    EMAIL = 'email',
    GOOGLE = 'google',
    PASSWORDLESS = 'passwordless'
};

enum AUTH_PURPOSE {
    SIGNUP = 'register',
    LOGIN = 'login',
    RETRY_EMAIL_VERIFICATION = 'retryemailverification',
    MAGIC_LINK = 'magiclink',
    OTP = 'otp',
};

enum AUTH_RESPONSE {
    RETRY_VERIFICATION = 'Email not verified, kindly verify email',
};

enum BOOLEAN_VALUES {
    TRUE = 'true',
    FALSE = 'false',
};

enum TYPE_SWITCH {
    BOOLEAN = 'boolean',
    NATIVE_OBJECT = 'object',
    OBJECT = 'Object',
    STRING = 'string',
    NUMBER = 'number',
    INTERFACE = 'interface',
};

enum REQUEST_PAYLOAD {
    BODY = 'body',
    HEADERS = 'headers',
    PARAMS = 'params'
};

enum REQUEST_METHODS {
    POST = 'POST',
    GET = 'GET',
    PUT = 'PUT', 
    PATCH = 'PATCH',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS',
};

enum REQUEST_HEADERS {
    CONTENT_TYPE = 'Content-Type',
    AUTHORIZATION = 'Authorization',
};

enum JWT {
    FAILED = 'Unexpected failure',
    UNAUTHORIZED = 'Action not allowed',
    EMPTY = 'Empty token',
    INVALID = 'Invalid Token',
    MISSING = 'Missing Token',
};  

enum JWT_CONFIG {
    EXPIRY = '1d',
    ALGORITHM = 'ES256'
}

enum NETWORK_CONFIG {
    SET_COOKIE = 'Set-Cookie',
    HTTP_ONLY = 'HttpOnly',
    SECURE = 'Secure',
    SAME_SITE = 'SameSite=Strict',
    DEFAULT_TOKEN_AGE = 86400, // Default token age (24 hours)
    PATH = 'Path=/',
}

enum SIGNUP_MESSAGE {
    EMPTY_TOKEN = '',
    PROCESSING = 'Processing',
    CREATED = 'Account has been created successfully',
    EXISTING_USER = 'Account already exists',
    FAILED = 'Account creation failed',
    NO_CONTENT = 'Account do not exists',
};

enum LOGIN_MESSAGE {
    EMPTY = '',
    EMPTY_TOKEN = '',
    PROCESSING = 'Processing',
    NOT_VERIFIED = 'Please verify email',
    NO_CONTENT = 'Account do not exists',
    EMAIL_DO_NOT_EXISTS = 'Email do not exists',
    WRONG_AUTHENTICATION = 'Wrong Password',
    VERIFICATION_FAILED = 'Retry Verification',
    SUCCESS = 'Logging In',
    FAILED = 'Server Error',
};

enum PASSWORDLESS_AUTHENTICATION_MESSAGE {
    EMPTY_TOKEN = '',
    SUCCESS = 'Logging In',
    FAILED = 'Authentication Failed, Retry',
};

enum REDIS_MESSAGE {
    FAILED = 'Redis Failure',
    NO_CONTENT = 'No Data In Redis',
};

enum NODE_MAILER_MESSAGE {
    SEND_EMAIL_FOR_VERIFICATION = 'sendEmailForVerification',
    VERIFY_ACCOUNT_SUBJECT = 'Verify Account',
    MAGIC_LINK_SUBJECT = 'Magic Link',
    ENCODING = 'utf8',
};

enum EJS_PATHS {
    RETRY_EMAIL_VERIFICATION = './views/email_verify.ejs',
    RETRY_EMAIL_VERIFICATION_CSS = './views/email_verify.css',
    MAGIC_LINK = './views/magic_link.ejs',
    MAGIC_LINK_CSS = './views/magic_link.css',
    REDIRECT_EMAIL_VERIFICATION = './redirect_email_verification.ejs',
    REDIRECT_EMAIL_VERIFICATION_CSS = './redirect_email_verification.css',
};

enum STATUS_CODES {
    CONTINUE = 100,                           // Request received, please continue.
    SWITCHING_PROTOCOLS = 101,                // Server switching protocols as requested.
    PROCESSING = 102,                         // (WebDAV) Request is being processed.
    EARLY_HINTS = 103,                        // Preliminary headers; final response pending.

    OK = 200,                                 // Request succeeded.
    CREATED = 201,                            // Resource successfully created.
    ACCEPTED = 202,                           // Request accepted for processing (not complete).
    NON_AUTHORITATIVE_INFORMATION = 203,      // Returned meta-information is not from the origin server.
    NO_CONTENT = 204,                         // Request succeeded; no content returned.
    RESET_CONTENT = 205,                      // Client should reset view (e.g., form reset).
    PARTIAL_CONTENT = 206,                    // Partial data returned due to range header.
    MULTI_STATUS = 207,                       // (WebDAV) Multiple status codes for multiple resources.
    ALREADY_REPORTED = 208,                   // (WebDAV) Already reported in a previous response.
    IM_USED = 226,                            // Instance manipulation applied; response represents the result.

    MULTIPLE_CHOICES = 300,                   // Multiple options for the resource.
    MOVED_PERMANENTLY = 301,                  // Resource permanently moved to a new URL.
    FOUND = 302,                              // Resource temporarily located at a different URL.
    SEE_OTHER = 303,                          // Response can be found under a different URL with GET.
    NOT_MODIFIED = 304,                       // Resource not modified since last request.
    USE_PROXY = 305,                          // (Deprecated) Must access through the specified proxy.
    TEMPORARY_REDIRECT = 307,                 // Request should be repeated with a different URL.
    PERMANENT_REDIRECT = 308,                 // Resource permanently moved; use new URL in future.

    BAD_REQUEST = 400,                        // Malformed request syntax.
    UNAUTHORIZED = 401,                       // Authentication is required or failed.
    PAYMENT_REQUIRED = 402,                   // Reserved for future use.
    FORBIDDEN = 403,                          // Client does not have permission.
    NOT_FOUND = 404,                          // Resource not found.
    METHOD_NOT_ALLOWED = 405,                 // Request method is not supported.
    NOT_ACCEPTABLE = 406,                     // Content not acceptable according to Accept header.
    PROXY_AUTHENTICATION_REQUIRED = 407,      // Authentication with proxy is required.
    REQUEST_TIMEOUT = 408,                    // Request timed out.
    CONFLICT = 409,                           // Request conflicts with current server state.
    GONE = 410,                               // Resource is permanently removed.
    LENGTH_REQUIRED = 411,                    // Missing Content-Length header.
    PRECONDITION_FAILED = 412,                // Preconditions in the request header not met.
    PAYLOAD_TOO_LARGE = 413,                  // Request entity too large.
    URI_TOO_LONG = 414,                       // URI exceeds maximum length.
    UNSUPPORTED_MEDIA_TYPE = 415,             // Media type not supported.
    RANGE_NOT_SATISFIABLE = 416,              // Requested range not available.
    EXPECTATION_FAILED = 417,                 // Server cannot meet the Expect header.
    IM_A_TEAPOT = 418,                        // I'm a teapot (RFC 2324, humorous code).
    MISDIRECTED_REQUEST = 421,                // Request directed to a server that cannot produce a response.
    UNPROCESSABLE_ENTITY = 422,               // (WebDAV) Well-formed but semantic errors.
    LOCKED = 423,                             // (WebDAV) Resource is locked.
    FAILED_DEPENDENCY = 424,                  // (WebDAV) Dependency failure.
    TOO_EARLY = 425,                          // Server unwilling to risk processing a replayed request.
    UPGRADE_REQUIRED = 426,                   // Client should switch protocols.
    PRECONDITION_REQUIRED = 428,              // Request must be conditional.
    TOO_MANY_REQUESTS = 429,                  // Rate limit exceeded.
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,    // Request header fields too large.
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,      // Resource unavailable due to legal reasons.

    INTERNAL_SERVER_ERROR = 500,              // Generic server error.
    NOT_IMPLEMENTED = 501,                    // Server does not support the functionality.
    BAD_GATEWAY = 502,                        // Invalid response from upstream server.
    SERVICE_UNAVAILABLE = 503,                // Server overloaded or under maintenance.
    GATEWAY_TIMEOUT = 504,                    // Upstream server did not respond in time.
    HTTP_VERSION_NOT_SUPPORTED = 505,         // HTTP version not supported by the server.
    VARIANT_ALSO_NEGOTIATES = 506,            // Circular reference in content negotiation.
    INSUFFICIENT_STORAGE = 507,               // (WebDAV) Server cannot store the requested representation.
    LOOP_DETECTED = 508,                      // (WebDAV) Infinite loop detected.
    NOT_EXTENDED = 510,                       // Further extensions required for the request.
    NETWORK_AUTHENTICATION_REQUIRED = 511,    // Client must authenticate to gain network access.
};

enum ERRORS {
    CONTINUE = "Request received. Please continue.",
    SWITCHING_PROTOCOLS = "The server is switching protocols as requested.",
    PROCESSING = "The request is currently being processed.",
    EARLY_HINTS = "Preliminary response headers sent. Final response is pending.",

    OK = "The request was successful.",
    CREATED = "The resource was created successfully.",
    ACCEPTED = "The request has been accepted and is being processed.",
    NON_AUTHORITATIVE_INFORMATION = "The information is from a third-party source.",
    NO_CONTENT = "The request was successful, but no content is being returned.",
    RESET_CONTENT = "The request was successful. Please reset the form/view.",
    PARTIAL_CONTENT = "The server is returning partial data.",
    MULTI_STATUS = "Multiple statuses were returned for the request.",
    ALREADY_REPORTED = "This item has already been reported.",
    IM_USED = "Instance manipulation was applied to this resource.",

    MULTIPLE_CHOICES = "There are multiple options available for this resource.",
    MOVED_PERMANENTLY = "The resource has been permanently moved to a new URL.",
    FOUND = "The resource is temporarily available at a different location.",
    SEE_OTHER = "Please refer to another URL for the response.",
    NOT_MODIFIED = "The resource has not changed since the last request.",
    USE_PROXY = "This request must be sent through a proxy.",
    TEMPORARY_REDIRECT = "The resource is temporarily located at a new URL.",
    PERMANENT_REDIRECT = "The resource has permanently moved to a new URL.",

    BAD_REQUEST = "The request was malformed or invalid.",
    UNAUTHORIZED = "Authentication is required to complete this request.",
    PAYMENT_REQUIRED = "Payment is required to access this resource.",
    FORBIDDEN = "You do not have permission to access this resource.",
    NOT_FOUND = "The requested resource could not be found.",
    METHOD_NOT_ALLOWED = "The request method is not allowed for this resource.",
    NOT_ACCEPTABLE = "The requested format is not supported.",
    PROXY_AUTHENTICATION_REQUIRED = "Proxy authentication is required.",
    REQUEST_TIMEOUT = "The request timed out before completion.",
    CONFLICT = "The request could not be completed due to a conflict.",
    GONE = "The requested resource is no longer available.",
    LENGTH_REQUIRED = "Content-Length header is missing.",
    PRECONDITION_FAILED = "Preconditions in the request were not met.",
    PAYLOAD_TOO_LARGE = "The request payload exceeds the allowed size.",
    URI_TOO_LONG = "The URI is too long for the server to process.",
    UNSUPPORTED_MEDIA_TYPE = "The media type of the request is not supported.",
    RANGE_NOT_SATISFIABLE = "The requested range is not satisfiable.",
    EXPECTATION_FAILED = "The server could not meet the Expect header requirements.",
    IM_A_TEAPOT = "The server refuses to brew coffee because it is a teapot.",
    MISDIRECTED_REQUEST = "The request was sent to the wrong server.",
    UNPROCESSABLE_ENTITY = "The request was well-formed but contains semantic errors.",
    LOCKED = "The resource is locked and cannot be modified.",
    FAILED_DEPENDENCY = "The request failed due to a failed dependency.",
    TOO_EARLY = "The request was sent too early and might be replayed.",
    UPGRADE_REQUIRED = "Upgrade is required to proceed with the request.",
    PRECONDITION_REQUIRED = "A required precondition is missing.",
    TOO_MANY_REQUESTS = "Too many requests have been made in a short time. Please wait.",
    REQUEST_HEADER_FIELDS_TOO_LARGE = "Request headers are too large to process.",
    UNAVAILABLE_FOR_LEGAL_REASONS = "This content is unavailable due to legal restrictions.",

    INTERNAL_SERVER_ERROR = "An internal server error occurred. Please try again later.",
    NOT_IMPLEMENTED = "This functionality is not supported by the server.",
    BAD_GATEWAY = "The server received an invalid response from an upstream service.",
    SERVICE_UNAVAILABLE = "The service is temporarily unavailable. Please try again later.",
    GATEWAY_TIMEOUT = "The server did not receive a timely response from an upstream service.",
    HTTP_VERSION_NOT_SUPPORTED = "The HTTP version used is not supported by the server.",
    VARIANT_ALSO_NEGOTIATES = "A variant for content negotiation caused a conflict.",
    INSUFFICIENT_STORAGE = "The server cannot store the representation needed to complete the request.",
    LOOP_DETECTED = "An infinite loop was detected during request processing.",
    NOT_EXTENDED = "Further extensions are required to fulfill the request.",
    NETWORK_AUTHENTICATION_REQUIRED = "Network authentication is required to access this resource."
};

export class Constants {
    static readonly DEV_CONTROLLER = DEV_CONTROLLER;
    static readonly DEMO_SWITCH = DEMO_SWITCH;

    static readonly DB = DB;
    static readonly QUEUE_DB = QUEUE_DB;
    static readonly DB_TIMEOUTS = DB_TIMEOUTS;

    static readonly LOKI_LOGGER = LOKI_LOGGER;
    static readonly LOKI_LOGGER_LABELS = LOKI_LOGGER_LABELS;
    static readonly SERIALISATION_KEYS = SERIALISATION_KEYS;

    static readonly ROUTES = ROUTES;
    static readonly AUTH_CHANNELS = AUTH_CHANNELS;
    static readonly AUTH_PURPOSE = AUTH_PURPOSE;
    static readonly AUTH_RESPONSE = AUTH_RESPONSE;
    
    static readonly BOOLEAN_VALUES = BOOLEAN_VALUES;
    static readonly TYPE_SWITCH = TYPE_SWITCH;

    static readonly REQUEST_PAYLOAD = REQUEST_PAYLOAD;
    static readonly REQUEST_METHODS = REQUEST_METHODS;
    static readonly REQUEST_HEADERS = REQUEST_HEADERS;

    static readonly JWT = JWT;
    static readonly JWT_CONFIG = JWT_CONFIG;
    static readonly NETWORK_CONFIG = NETWORK_CONFIG;

    static readonly SIGNUP_MESSAGE = SIGNUP_MESSAGE;
    static readonly LOGIN_MESSAGE = LOGIN_MESSAGE;
    static readonly PASSWORDLESS_AUTHENTICATION_MESSAGE = PASSWORDLESS_AUTHENTICATION_MESSAGE;
    static readonly REDIS_MESSAGE = REDIS_MESSAGE;
    static readonly NODE_MAILER_MESSAGE = NODE_MAILER_MESSAGE;
    static readonly EJS_PATHS = EJS_PATHS;

    static readonly STATUS_CODES = STATUS_CODES;
    static readonly ERRORS = ERRORS;
};
enum LOKI_LOGGER {
    TARGET = 'winston-loki',
    APPLICATION = 'authentication',
    DEMOENV = 'demo',
    PRODENV = 'prod',
};

enum LOKI_LOGGER_LABELS {
    REQUEST_TYPE = 'https',
    SIGNUP_REQUEST = 'signup-request',
    LOGIN_REQUEST = 'login-request',
    EMAIL = 'email',
    GOOGLE = 'google',
    PASSWORDLESS = 'passwordless'
};

enum AUTH_CHANNELS {
    EMAIL = 'email',
    GOOGLE = 'google',
    PASSWORDLESS = 'passwordless'
};

enum AUTH_PURPOSE {
    SIGNUP = 'register',
    LOGIN = 'login'
};

enum AUTH_RESPONSE {
    RETRY_VERIFICATION = 'Email not verified, kindly verify email',
};

enum BOOLEAN_VALUES {
    TRUE = 'TRUE',
    FALSE = 'FALSE',
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
    static readonly LOKI_LOGGER = LOKI_LOGGER;
    static readonly LOKI_LOGGER_LABELS = LOKI_LOGGER_LABELS;

    static readonly AUTH_CHANNELS = AUTH_CHANNELS;
    static readonly AUTH_PURPOSE = AUTH_PURPOSE;
    static readonly AUTH_RESPONSE = AUTH_RESPONSE;

    static readonly BOOLEAN_VALUES = BOOLEAN_VALUES;

    static readonly REQUEST_PAYLOAD = REQUEST_PAYLOAD;
    static readonly REQUEST_METHODS = REQUEST_METHODS;
    static readonly REQUEST_HEADERS = REQUEST_HEADERS;

    static readonly JWT = JWT;

    static readonly STATUS_CODES = STATUS_CODES;
    static readonly ERRORS = ERRORS;
};
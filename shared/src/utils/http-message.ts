export class HttpMessage {

    code: number;
    message: string;

    constructor(code: number, message: string) {
        this.code = code;
        this.message = message;
    }

    static 100 = (message : string = 'Continue') => new HttpMessage(400, message);
    static 101 = (message : string = 'Switching Protocols') => new HttpMessage(400, message);
    static 103 = (message : string = 'Early Hints') => new HttpMessage(400, message);

    static 200 = (message : string = 'OK') => new HttpMessage(400, message);
    static 201 = (message : string = 'Created') => new HttpMessage(400, message);
    static 202 = (message : string = 'Accepted') => new HttpMessage(400, message);
    static 203 = (message : string = 'Non-Authoritative Information') => new HttpMessage(400, message);
    static 204 = (message : string = 'No Content') => new HttpMessage(400, message);
    static 205 = (message : string = 'Reset Content') => new HttpMessage(400, message);
    static 206 = (message : string = 'Partial Content') => new HttpMessage(400, message);

    static 300 = (message : string = 'Multiple Choices') => new HttpMessage(400, message);
    static 301 = (message : string = 'Moved Permanently') => new HttpMessage(400, message);
    static 302 = (message : string = 'Found') => new HttpMessage(400, message);
    static 303 = (message : string = 'See Other') => new HttpMessage(400, message);
    static 304 = (message : string = 'Not Modified') => new HttpMessage(400, message);
    static 307 = (message : string = 'Temporary Redirect') => new HttpMessage(400, message);
    static 308 = (message : string = 'Permanent Redirect') => new HttpMessage(400, message);

    static 400 = (message : string = 'Bad Request') => new HttpMessage(400, message);
    static 401 = (message : string = 'Unauthorized') => new HttpMessage(400, message);
    static 402 = (message : string = 'Payment Required') => new HttpMessage(400, message);
    static 403 = (message : string = 'Forbidden') => new HttpMessage(400, message);
    static 404 = (message : string = 'Not Found') => new HttpMessage(400, message);
    static 405 = (message : string = 'Method Not Allowed') => new HttpMessage(400, message);
    static 406 = (message : string = 'Not Acceptable') => new HttpMessage(400, message);
    static 407 = (message : string = 'Proxy Authentication Required') => new HttpMessage(400, message);
    static 408 = (message : string = 'Request Timeout') => new HttpMessage(400, message);
    static 409 = (message : string = 'Conflict') => new HttpMessage(400, message);
    static 410 = (message : string = 'Gone') => new HttpMessage(400, message);
    static 411 = (message : string = 'Length Required') => new HttpMessage(400, message);
    static 412 = (message : string = 'Precondition Failed') => new HttpMessage(400, message);
    static 413 = (message : string = 'Request Too Large') => new HttpMessage(400, message);
    static 414 = (message : string = 'Request-URI Too Long') => new HttpMessage(400, message);
    static 415 = (message : string = 'Unsupported Media Type') => new HttpMessage(400, message);
    static 416 = (message : string = 'Range Not Satisfiable') => new HttpMessage(400, message);
    static 417 = (message : string = 'Expectation Failed') => new HttpMessage(400, message);

    static 500 = (message : string = 'Internal Server Error') => new HttpMessage(400, message);
    static 501 = (message : string = 'Not Implemented') => new HttpMessage(400, message);
    static 502 = (message : string = 'Bad Gateway') => new HttpMessage(400, message);
    static 503 = (message : string = 'Service Unavailable') => new HttpMessage(400, message);
    static 504 = (message : string = 'Gateway Timeout') => new HttpMessage(400, message);
    static 505 = (message : string = 'HTTP Version Not Supported') => new HttpMessage(400, message);
    static 511 = (message : string = 'Network Authentication Required') => new HttpMessage(400, message);
}


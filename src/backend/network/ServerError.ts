export class ServerError extends Error {
  statusCode: number;
  httpCodeMessage: string; // different from the main message. This should reflect what the status code itself means
  cause: any

  constructor(message: string, statusCode: number, httpCodeMessage: string, cause?: any) {
    super(message);
    this.name = 'ServerError';
    this.statusCode = statusCode;
    this.httpCodeMessage = httpCodeMessage;
    this.cause = cause
    if (this.message === "") {
      this.message = httpCodeMessage;
    }

    // This line is necessary for proper prototype chain inheritance
    Object.setPrototypeOf(this, ServerError.prototype);
  }

  static badRequest(message: string): ServerError {
    return new ServerError(message, 400, "Bad Request");
  }

  static unauthorized(message: string): ServerError {
    return new ServerError(message, 401, "Unauthorized");
  }

  static forbidden(message: string): ServerError {
    return new ServerError(message, 403, "Forbidden");
  }

  static notFound(message: string): ServerError {
    return new ServerError(message, 404, "Not Found");
  }

  static methodNotAllowed(message: string): ServerError {
    return new ServerError(message, 405, "Method Not Allowed");
  }

  static conflict(message: string): ServerError {
    return new ServerError(message, 409, "Conflict");
}

  static teapot(message: string, cause?: any): ServerError {
    return new ServerError(message, 418, "I'm a Teapot", cause);
  }

  static internalServerError(message: string, cause: any): ServerError {
    return new ServerError(message, 500, "Internal Server Error", cause);
  }

  static notImplemented(message: string): ServerError {
    return new ServerError(message, 501, "Service Not Implemented");
  }

  static serviceUnavailable(message: string, cause: any): ServerError {
    return new ServerError(message, 503, "Service Unavailable", cause);
  }
}

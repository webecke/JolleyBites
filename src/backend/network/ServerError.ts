export class ServerError extends Error {
  statusCode: number;
  httpCodeMessage: string; // different from the main message. This should reflect what the status code itself means

  constructor(message: string, statusCode: number, httpCodeMessage: string) {
    super(message);
    this.name = 'ServerError';
    this.statusCode = statusCode;
    this.httpCodeMessage = httpCodeMessage;
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

  static teapot(message: string): ServerError {
    return new ServerError(message, 418, "I'm a Teapot");
  }

  static internalServerError(message: string): ServerError {
    return new ServerError(message, 500, "Internal Server Error");
  }

  static notImplemented(message: string): ServerError {
    return new ServerError(message, 501, "Service Not Implemented");
  }

  static serviceUnavailable(message: string): ServerError {
    return new ServerError(message, 503, "Service Unavailable");
  }
}

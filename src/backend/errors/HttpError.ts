export class HttpError extends Error {
  statusCode: number;
  httpCodeMessage: string; // different from the main message. This should reflect what the status code itself means

  constructor(message: string, statusCode: number, httpCodeMessage: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.httpCodeMessage = httpCodeMessage;
    if (this.message === "") {
      this.message = httpCodeMessage;
    }

    // This line is necessary for proper prototype chain inheritance
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  static badRequest(message: string): HttpError {
    return new HttpError(message, 400, "Bad Request");
  }

  static unauthorized(message: string): HttpError {
    return new HttpError(message, 401, "Unauthorized");
  }

  static forbidden(message: string): HttpError {
    return new HttpError(message, 403, "Forbidden");
  }

  static notFound(message: string): HttpError {
    return new HttpError(message, 404, "Not Found");
  }

  static methodNotAllowed(message: string): HttpError {
    return new HttpError(message, 405, "Method Not Allowed");
  }

  static conflict(message: string): HttpError {
    return new HttpError(message, 409, "Conflict");
}

  static teapot(message: string): HttpError {
    return new HttpError(message, 418, "I'm a Teapot");
  }

  static internalServerError(message: string): HttpError {
    return new HttpError(message, 500, "Internal Server Error");
  }

  static notImplemented(message: string): HttpError {
    return new HttpError(message, 501, "Service Not Implemented");
  }

  static serviceUnavailable(message: string): HttpError {
    return new HttpError(message, 503, "Service Unavailable");
  }
}
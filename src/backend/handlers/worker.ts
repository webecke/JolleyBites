import { handleApiRoutes } from './api'

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext):
    Promise<Response> {
    console.log("HEY")
    console.log(request.method)
    console.log(request.url)
    console.log(await request.headers)
    console.log(await request.headers)
    try {
      //Preflight:
      if (request.method === 'OPTIONS') {
        return handleCors(request)
      }

      const url = new URL(request.url);
      const path: String = url.pathname; // Extract the path from the URL

      if (path == "/nathan") {
        return addCorsHeaders( new Response("YOU DID IT", {status: 200}), request.headers.get('Origin'))
      }

      const apiToken = path.split("/")[1]
      const apiPath = path.substring(apiToken.length + 2);

      switch (apiToken) {
        case "auth":
          return addCorsHeaders( (new Response("Hey, we haven't made the auth stuff yet, but here you go!", { status: 200 })), request.headers.get('Origin') )
        case "api":
          return addCorsHeaders( await handleApiRoutes(apiPath, request, env), request.headers.get('Origin') )
      }

      switch (path) {
        case '/':
          throw HttpError.teapot("Hey look at that, you called the generic endpoint. I don't really want to do anything for you. Thus, enjoy code 418.")
        default:
          return new Response('404 Not Found', { status: 404 });
      }
    } catch (error) {
      if (error instanceof HttpError) {
        return new Response("HttpError: " + error.message, { status: error.statusCode })
      } else {
        // Handle other types of errors
        console.error("Unexpected error:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    }
  },
}

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

  static teapot(message: string): HttpError {
    return new HttpError(message, 418, "I'm a Teapot");
  }

  static internalServerError(message: string): HttpError {
    return new HttpError(message, 500, "Internal Server Error");
  }

  static serviceUnavailable(message: string): HttpError {
    return new HttpError(message, 503, "Service Unavailable");
  }
}


function addCorsHeaders(response: Response, origin: string | null): Response {
  if (origin === null) {
    // If origin is null, we'll allow any origin but won't send credentials
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

function handleCors(request: Request): Response {
  const origin = request.headers.get('Origin') || '';

  // Create a new response for the preflight request
  const response = new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    }
  });

  return response;
}
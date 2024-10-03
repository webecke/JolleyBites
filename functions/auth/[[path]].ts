import { EventContext } from '@cloudflare/workers-types';
import { addCorsHeaders, Env, handleCors, parseNextApiToken } from '../requestTools'
import { Request as CfRequest } from '@cloudflare/workers-types';
import { HttpError } from '../../src/backend/errors/HttpError'
import { handleAuthRequest } from '../../src/backend/handlers/authHandler'

/*
  This is the function that Cloudflare passes the request to for /auth requests
 */
export const onRequest = async (
  context: EventContext<Env, any, Record<string, unknown>>
): Promise<Response> => {

  // Preflight Cors check
  if (context.request.method === "OPTIONS") {
    return handleCors(context.request)
  }

  try {
    // where most requests go
    const response = await processAuthRequest(context);
    //response.headers.set('Content-Type', 'application/json')
    return addCorsHeaders(response, context.request.headers.get('Origin'));

  } catch (error) {
    let errorResponse: Response;
    if (error instanceof HttpError) {
      errorResponse = new Response("Error: " + error.message, { status: error.statusCode });
    } else {
      errorResponse = new Response("Error, and we have no clue what happened", { status: 500 });
    }
    return addCorsHeaders(errorResponse, context.request.headers.get('Origin'));
  }
};

async function processAuthRequest(
  context: EventContext<Env, any, Record<string, unknown>>
): Promise<Response>  {
  const request: CfRequest = context.request
  const env: Env = context.env

  const url = new URL(request.url);
  const path: String = url.pathname.substring(5); // Extract the path from the URL, remove the '/api/'

  const {apiToken, apiPath} = parseNextApiToken(path)

  try {
    switch (apiToken) {
      case "":
        return await handleAuthRequest(apiPath, request, env)
      default:
        throw HttpError.notFound("Sorry, looks like that endpoint isn't here");
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return new Response("Error: " + error.message, { status: error.statusCode })
    } else {
      console.error("Unlabeled error: " + error)
      return new Response("Error, and we have no clue what happened", { status: 500 })
    }
  }
}
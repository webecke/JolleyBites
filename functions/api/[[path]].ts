import { EventContext, D1Database } from '@cloudflare/workers-types';
import { Env, parseNextApiToken } from '../requestTools'
import { handleIngredientsRequest } from '../../src/backend/handlers/ingredientsHandler'
import { Request as CfRequest } from '@cloudflare/workers-types';
import { HttpError } from '../../src/backend/errors/HttpError'

/*
  This is the function that Cloudflare passes the request to.
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
    const response = await processRequest(context);
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

async function processRequest(
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
        return new Response("Oh hey! You found the api! But you didn't actually hit an endpoint, just the entrance... have a great day!")
      case "auth":
        return new Response("Hey, we haven't made the auth stuff yet, but here you go!", { status: 200 })
      case "ingredients":
        return await handleIngredientsRequest(apiPath, request, env)
      default:
        throw HttpError.notFound("Sorry, looks like that endpoint isn't here");
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return new Response("Error: " + error.message, { status: error.statusCode })
    } else {
      return new Response("Error, and we have no clue what happened", { status: 500 })
    }
  }
}


function addCorsHeaders(response: Response, origin: string | null): Response {
  const allowedOrigins = ['http://localhost:5173', 'https://jolleybites.webecke.dev']; // Add your allowed origins

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  } else {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}


function handleCors(request: CfRequest): Response {
  const origin = request.headers.get('Origin') || '';

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
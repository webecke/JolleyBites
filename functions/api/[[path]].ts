import { EventContext, Request as CfRequest } from '@cloudflare/workers-types'
import { addCorsHeaders, Env, handleCors, parseNextApiToken } from '../requestTools'
import { handleIngredientsRequest } from '../../src/backend/handlers/ingredientsHandler'
import { HttpError } from '../../src/backend/errors/HttpError'
import { DataAccessMachine } from '../../src/backend/dataAccess/dataAccessMachine'
import { User } from '../../src/shared/types'
import { AuthTokenPayload, verifyToken } from '../../src/backend/utils/authTokenUtils'
import { handleRecipesRequest } from '../../src/backend/handlers/recipesHandler'

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

  const dataAccessMachine = new DataAccessMachine(env.DB)
  env.user = await getUserFromAuth(request.headers.get('Authorization'), dataAccessMachine)
  env.dataAccessMachine = dataAccessMachine

  if (env.user == null) { throw HttpError.unauthorized("AuthToken invalid") }

  const url = new URL(request.url);
  const path: String = url.pathname.substring(5); // Extract the path from the URL, remove the '/api/'

  const {apiToken, apiPath} = parseNextApiToken(path)

  try {
    switch (apiToken) {
      case "":
        return new Response("Oh hey! You found the api! But you didn't actually hit an endpoint, just the entrance... have a great day!")
      case "ingredients":
        return await handleIngredientsRequest(apiPath, request, env)
      case "recipes":
        return await handleRecipesRequest(apiPath, request, env)
      default:
        throw HttpError.notFound("Sorry, looks like that endpoint isn't here");
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return new Response("Error: " + error.message, { status: error.statusCode })
    } else {
      console.error("Non-HttpError: ", error)
      return new Response("Error, and we have no clue what happened", { status: 500 })
    }
  }
}

async function getUserFromAuth(authToken: string, dataAccessMachine: DataAccessMachine): Promise<User> {
  const authTokenPayload: AuthTokenPayload = await verifyToken(authToken)

  if (authTokenPayload == null) { throw HttpError.unauthorized("Invalid authToken")}

  const userDataAccess = dataAccessMachine.getUserDA()

  return userDataAccess.getUserById(authTokenPayload.user_id)
}
import { EventContext, D1Database } from '@cloudflare/workers-types';
import { Env } from '../requestTools'
import { handleIngredientsRequest } from '../../src/backend/handlers/ingredientsHandler'
import { Request as CfRequest } from '@cloudflare/workers-types';
import { HttpError } from '../../src/backend/errors/HttpError'


export const onRequest = async (
  context: EventContext<Env, any, Record<string, unknown>>
): Promise<Response> => {
      const request: CfRequest = context.request
      const env: Env = context.env

      const url = new URL(request.url);
      const path: String = url.pathname.substring(5); // Extract the path from the URL, remove the '/api/'

      if (path == "nathan") {
        return new Response("NATHAN")
      }

      const apiToken = path.split("/")[0]
      const apiPath = path.substring(apiToken.length + 2);

      try {
        switch (apiToken) {
          case "":
            return new Response("Oh hey! You found the api! But you didn't actually hit an endpoint, just the entrance... have a great day!")
          case "auth":
            return new Response("Hey, we haven't made the auth stuff yet, but here you go!", { status: 200 })
          case "ingredients":
            return handleIngredientsRequest(apiPath, request, env)
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

};
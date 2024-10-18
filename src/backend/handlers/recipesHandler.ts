import { Request as CfRequest } from '@cloudflare/workers-types'
import { type Env, parseNextApiToken } from '../../../functions/requestTools'
import { HttpError } from '../errors/HttpError'
import { RecipeDataAccess } from '../dataAccess/recipeDataAccess'

export async function handleRecipesRequest (path: String, request: CfRequest, env: Env): Promise<Response> {
  const {apiToken, apiPath} = parseNextApiToken(path)

  const requestType = request.method

  switch (requestType) {
    case "POST":
      return await processNewRecipeRequest(path, request, env)
    default:
      console.error(requestType)
      throw HttpError.methodNotAllowed(`Request type of ${requestType} not allowed at this endpoint`)
  }
}

async function processNewRecipeRequest(path: String, request: CfRequest, env: Env): Promise<Response> {
  const reqBody: any = await request.json()
  const recipeDataAccess = new RecipeDataAccess(env.DB)

  if ('name' in reqBody) {
    const recipeId = await recipeDataAccess.insertNewRecipe(reqBody.name, env.user.id)
    return new Response(JSON.stringify({recipeId: recipeId}), {status: 201})
  } else {
    throw HttpError.badRequest(`Missing name for new recipe`);
  }
}
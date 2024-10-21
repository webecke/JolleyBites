import { Request as CfRequest } from '@cloudflare/workers-types'
import { type Env, parseNextApiToken } from '../../../functions/requestTools'
import { HttpError } from '../errors/HttpError'
import { RecipeDataAccess } from '../dataAccess/recipeDataAccess'
import type { RecipeMetaUpdate } from '../../shared/messages'
import type { Recipe } from '../../shared/types'

export async function handleRecipesRequest (path: String, request: CfRequest, env: Env): Promise<Response> {
  const requestType = request.method

  switch (requestType) {
    case "POST":
      return await processNewRecipeRequest(request, env)
    case "PATCH":
      return await processPatchRecipeRequest(path, request, env)
    case "GET":
      return await processGetRecipesRequest(path, request, env)
    case "DELETE":
      return await processDeleteRecipeRequest(path, request, env)
    default:
      console.error(requestType)
      throw HttpError.methodNotAllowed(`Request type of ${requestType} not allowed at this endpoint`)
  }
}

async function processNewRecipeRequest(request: CfRequest, env: Env): Promise<Response> {
  const reqBody: any = await request.json()
  const recipeDataAccess = new RecipeDataAccess(env.DB)

  if ('name' in reqBody) {
    const recipeId = await recipeDataAccess.insertNewRecipe(reqBody.name, env.user.id)
    return new Response(JSON.stringify({recipeId: recipeId}), {status: 201})
  } else {
    throw HttpError.badRequest(`Missing name for new recipe`);
  }
}

async function processGetRecipesRequest(path: String, request: CfRequest, env: Env): Promise<Response> {
  const {apiToken} = parseNextApiToken(path)
  const recipeDataAccess = new RecipeDataAccess(env.DB)

  if (apiToken == "") {
    return new Response(JSON.stringify(await recipeDataAccess.getRecipesForUser(env.user.id)), { status: 200 });
  } else {
    const id = Number(apiToken)
    if (isNaN(id)) {
      throw HttpError.badRequest("Recipe id must be a number")
    }

    const recipe = await recipeDataAccess.getRecipeById(id)

    if (recipe == null) {
      throw HttpError.notFound("Recipe not found with id [" + apiToken + "]")
    } else if (recipe.user_id != env.user.id) {
      throw HttpError.unauthorized("Recipe owned by a different user")
    }
    return new Response(JSON.stringify(recipe), { status: 200 })
  }
}

async function processDeleteRecipeRequest(path: String, request: CfRequest, env: Env): Promise<Response> {
  const {apiToken} = parseNextApiToken(path)
  const recipeDataAccess = new RecipeDataAccess(env.DB)

  const id = Number(apiToken)
  if (isNaN(id)) {
    throw HttpError.badRequest("Recipe id must be a number")
  }

  await recipeDataAccess.deleteRecipeById(id)
  return new Response(JSON.stringify({message: "Successfully deleted"}), {status: 200})
}

async function processPatchRecipeRequest(path: String, request: CfRequest, env: Env): Promise<Response> {
  const recipeDataAccess = new RecipeDataAccess(env.DB)
  const reqBody: any = await request.json()

  if ('recipeMetaUpdate' in reqBody) {
    const metaUpdate: RecipeMetaUpdate = reqBody.recipeMetaUpdate
    const currentRecipe: Recipe = await recipeDataAccess.getRecipeById(metaUpdate.id)

    if (currentRecipe == null) {
      throw HttpError.notFound("That recipe was not found")
    } else if (currentRecipe.user_id != env.user.id) {
      throw HttpError.forbidden("That recipe is owned by another user")
    }

    const updatedRecipe: Recipe = {
      id: currentRecipe.id,
      user_id: currentRecipe.user_id,
      name: metaUpdate.name,
      description: metaUpdate.description,
      servings_per_recipe: metaUpdate.servings_per_recipe,
      calculated_cost: currentRecipe.calculated_cost,
      instructions: metaUpdate.instructions,
      notes: metaUpdate.notes,
      created_at: currentRecipe.created_at,
      updated_at: new Date(Date.now())
    }
    const recipeId = await recipeDataAccess.updateRecipe(updatedRecipe)
    return new Response(JSON.stringify({recipeId: recipeId}), {status: 200})
  } else {
    throw HttpError.badRequest("Missing recipeMetaUpdate field")
  }
}
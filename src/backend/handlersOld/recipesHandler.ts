import { Request as CfRequest } from '@cloudflare/workers-types'
import { type Env, parseNextApiToken } from '../../../functions/requestTools'
import { ServerError } from '../network/ServerError'
import { RecipeDataAccess } from '../dataAccess/recipeDataAccess'
import type { RecipeMetaUpdate } from '../../shared/messages'
import type { Recipe } from '../../shared/types'
import { IngredientRecipeDataAccess } from '../dataAccess/ingredientRecipeDataAccess'

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
      throw ServerError.methodNotAllowed(`Request type of ${requestType} not allowed at this endpoint`)
  }
}

async function processNewRecipeRequest(request: CfRequest, env: Env): Promise<Response> {
  const reqBody: any = await request.json()
  const recipeDataAccess = new RecipeDataAccess(env.DB)

  if ('name' in reqBody) {
    const recipeId = await recipeDataAccess.insertNewRecipe(reqBody.name, env.user.id)
    return new Response(JSON.stringify({recipeId: recipeId}), {status: 201})
  } else {
    throw ServerError.badRequest(`Missing name for new recipe`);
  }
}

async function processGetRecipesRequest(path: String, request: CfRequest, env: Env): Promise<Response> {
  const {apiToken} = parseNextApiToken(path)

  const recipeDataAccess = new RecipeDataAccess(env.DB)

  if (apiToken == "") {
    return new Response(JSON.stringify(await recipeDataAccess.getRecipesForUser(env.user.id)), { status: 200 });
  } else {
    return await processGetSpecificRecipeRequest(path, request, env)
  }
}

async function processGetSpecificRecipeRequest(path: String, request: CfRequest, env: Env): Promise<Response> {
  const {apiToken, apiPath} = parseNextApiToken(path)
  console.error(apiPath)

  const id: number = Number(apiToken)
  if (isNaN(id)) {
    throw ServerError.badRequest("Recipe id must be a number")
  }

  if (apiPath == "ingredients") {
    return await processGetRecipeIngredientsRequest(id, env)
  }

  const recipeDataAccess = new RecipeDataAccess(env.DB)
  const recipe = await recipeDataAccess.getRecipeById(id)

  if (recipe == null) {
    throw ServerError.notFound("Recipe not found with id [" + apiToken + "]")
  } else if (recipe.user_id != env.user.id) {
    throw ServerError.unauthorized("Recipe owned by a different user")
  }
  return new Response(JSON.stringify(recipe), { status: 200 })
}

async function processGetRecipeIngredientsRequest(recipeId: number, env: Env): Promise<Response> {
  const dataAccess = new IngredientRecipeDataAccess(env.DB)

  const result = await dataAccess.getByRecipeId(recipeId, env.user.id)

  return new Response(JSON.stringify(result), { status: 200 })
}

async function processDeleteRecipeRequest(path: String, request: CfRequest, env: Env): Promise<Response> {
  const {apiToken} = parseNextApiToken(path)
  const recipeDataAccess = new RecipeDataAccess(env.DB)

  const id = Number(apiToken)
  if (isNaN(id)) {
    throw ServerError.badRequest("Recipe id must be a number")
  }

  await recipeDataAccess.deleteRecipeById(id)
  return new Response(JSON.stringify({message: "Successfully deleted"}), {status: 200})
}

async function processPatchRecipeRequest(path: String, request: CfRequest, env: Env): Promise<Response> {
  const recipeDataAccess = new RecipeDataAccess(env.DB)
  const reqBody: any = await request.json()

  if ('recipeMetaUpdate' in reqBody) {
    const metaUpdate: RecipeMetaUpdate = reqBody.recipeMetaUpdate
    const currentRecipe: Recipe | undefined = await recipeDataAccess.getRecipeById(metaUpdate.id)

    if (currentRecipe == undefined) throw ServerError.notImplemented("STOP USING THIS HANDLER")

    if (currentRecipe == null) {
      throw ServerError.notFound("That recipe was not found")
    } else if (currentRecipe.user_id != env.user.id) {
      throw ServerError.forbidden("That recipe is owned by another user")
    } else if (metaUpdate.name.trim() == "") {
      throw ServerError.badRequest("Name cannot be empty")
    } else if (metaUpdate.servings_per_recipe <= 0) {
      throw ServerError.badRequest("Servings per recipe must be greater than 0")
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
    throw ServerError.badRequest("Missing recipeMetaUpdate field")
  }
}

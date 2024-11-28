import type { Recipe, User } from '../../shared/types'
import type { DataAccessMachine } from '../dataAccess/dataAccessMachine'
import { ServerError } from '../network/ServerError'
import type { RecipeDataAccess } from '../dataAccess/recipeDataAccess'
import type { RecipeRequest } from '../../shared/request/RecipeRequests'

export const RecipeService = {
  createRecipe,
  getRecipesForUser,
  getRecipeById,
  deleteRecipe,
  updateRecipe
}

async function createRecipe(dataAccess: DataAccessMachine, user: User, recipeName: string): Promise<number>{
  const recipeDataAccess = dataAccess.getRecipeDA()
  return await recipeDataAccess.insertNewRecipe(recipeName, user.id)
}

async function getRecipesForUser(dataAccess: DataAccessMachine, user: User): Promise<Recipe[]> {
  return await dataAccess.getRecipeDA().getRecipesForUser(user.id)
}

async function getRecipeById(dataAccess: DataAccessMachine, user: User, id: number): Promise<Recipe> {
  const recipe = await dataAccess.getRecipeDA().getRecipeById(id)

  if (recipe == undefined) throw ServerError.notFound(`Recipe #${id} was not found`)
  if (recipe.user_id != user.id) throw ServerError.forbidden("Recipe #${id} does not belong to you")

  return recipe
}

async function deleteRecipe(dataAccess: DataAccessMachine, user: User, id: number): Promise<void> {
  const recipeDA: RecipeDataAccess = dataAccess.getRecipeDA()

  await throwIfNotFoundOrForbidden(recipeDA, user, id)

  await recipeDA.deleteRecipeById(id)
}

async function updateRecipe(dataAccess: DataAccessMachine, user: User, id: number, metaUpdate: RecipeRequest) {
  const recipeDA: RecipeDataAccess = dataAccess.getRecipeDA()

  const currentRecipe: Recipe = await throwIfNotFoundOrForbidden(recipeDA, user, id)

  const updatedRecipe: Recipe = {
    id: id,
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

  await recipeDA.updateRecipe(updatedRecipe)
}

async function throwIfNotFoundOrForbidden(recipeDA: RecipeDataAccess, user: User, id: number): Promise<Recipe> {
  const recipe = await recipeDA.getRecipeById(id)

  if (recipe == undefined) throw ServerError.notFound(`Recipe #${id} not found`)
  if (recipe.user_id != user.id) throw ServerError.forbidden(`Recipe #${id} doesn't belong to you`)

  return recipe
}

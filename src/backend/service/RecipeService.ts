import type { Recipe, User } from '../../shared/types'
import type { DataAccessMachine } from '../dataAccess/dataAccessMachine'
import { ServerError } from '../network/ServerError'

export const RecipeService = {
  createRecipe,
  getRecipesForUser,
  getRecipeById
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

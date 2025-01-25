import type { RecipeIngredient, Recipe, User } from '../../shared/types'
import type { DataAccessMachine } from '../dataAccess/dataAccessMachine'
import { ServerError } from '../network/ServerError'
import type { RecipeDataAccess } from '../dataAccess/recipeDataAccess'
import type { RecipeRequest } from '../../shared/request/RecipeRequests'
import type { RecipeIngredientDataAccess } from '../dataAccess/recipeIngredientDataAccess'
import { IngredientsDataAccess } from '../dataAccess/ingredientsDataAccess'

export const RecipeService = {
  createRecipe,
  getRecipesForUser,
  getRecipeById,
  deleteRecipe,
  updateRecipe,
  getIngredientsForRecipe
}

async function createRecipe(dataAccess: DataAccessMachine, user: User, recipeName: string): Promise<number>{
  const recipeDataAccess = dataAccess.getRecipeDA()
  return await recipeDataAccess.insertNewRecipe(recipeName, user.id)
}

async function getRecipesForUser(dataAccess: DataAccessMachine, user: User): Promise<Recipe[]> {
  return await dataAccess.getRecipeDA().getRecipesForUser(user.id)
}

async function getRecipeById(dataAccess: DataAccessMachine, user: User, id: number): Promise<Recipe> {
  return await throwIfNotFoundOrForbidden(dataAccess.getRecipeDA(), user, id)
}

async function deleteRecipe(dataAccess: DataAccessMachine, user: User, id: number): Promise<void> {
  const recipeDA: RecipeDataAccess = dataAccess.getRecipeDA()

  await throwIfNotFoundOrForbidden(recipeDA, user, id)

  await recipeDA.deleteRecipeById(id)
}

async function updateRecipe(dataAccess: DataAccessMachine, user: User, id: number, request: RecipeRequest) {
  const recipeDA: RecipeDataAccess = dataAccess.getRecipeDA()
  const recipeIngredientDA: RecipeIngredientDataAccess = dataAccess.getRecipeIngredientDA()

  const currentRecipe: Recipe = await throwIfNotFoundOrForbidden(recipeDA, user, id)

  const updatedRecipeMeta: Recipe = {
    id: id,
    user_id: currentRecipe.user_id,
    name: request.name,
    description: request.description,
    servings_per_recipe: request.servings_per_recipe,
    calculated_cost: await calculateCost(dataAccess, request.ingredients),
    instructions: request.instructions,
    notes: request.notes,
    created_at: currentRecipe.created_at,
    updated_at: new Date(Date.now())
  }
  await recipeDA.updateRecipe(updatedRecipeMeta)

  const keepIngredientIds = request.ingredients
    .filter(ingredient => ingredient.recipe_id === id)
    .map(ingredient => ingredient.ingredient_id);

  await recipeIngredientDA.deleteIngredientsNotInList(id, keepIngredientIds);

  for (const ingredient of request.ingredients) {
    if (ingredient.recipe_id === id) {
      await recipeIngredientDA.updateOrInsert(ingredient)
    } else {
      console.error(`User ${user.id} tried updating the ingredients of a recipe that they don't own. Attempted to change in recipe ${ingredient.recipe_id} in a request for recipe ${id}. Not throwing an error though.`)
    }
  }
}

async function getIngredientsForRecipe(dataAccess: DataAccessMachine, user: User, id: number): Promise<RecipeIngredient[]> {
  await throwIfNotFoundOrForbidden(dataAccess.getRecipeDA(), user, id)

  const recipeIngredients: RecipeIngredient[] = await dataAccess.getRecipeIngredientDA().getByRecipeId(id, user.id);
  return recipeIngredients;
}

async function throwIfNotFoundOrForbidden(recipeDA: RecipeDataAccess, user: User, id: number): Promise<Recipe> {
  const recipe = await recipeDA.getRecipeById(id)

  if (recipe == undefined) throw ServerError.notFound(`Recipe #${id} not found`)
  if (recipe.user_id != user.id) throw ServerError.forbidden(`Recipe #${id} doesn't belong to you`)

  return recipe
}

async function calculateCost(dataAccess: DataAccessMachine, recipeIngredients: RecipeIngredient[]): Promise<number> {
  let total = 0;
  const ingredientDA: IngredientsDataAccess = dataAccess.getIngredientsDA()

  for (const recipeIngredient of recipeIngredients) {
    const ingredient = await ingredientDA.getIngredientById(recipeIngredient.ingredient_id)
    if (ingredient === undefined) {
      throw ServerError.internalServerError("Error getting ingredients while calculating price", null)
    }

    total += ingredient.price_per_unit * recipeIngredient.quantity_in_recipe
  }

  return total
}

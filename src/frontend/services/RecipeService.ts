import { ServerCommunicator } from '@/services/ServerCommunicator'
import type { IngredientRecipe, Recipe } from '../../shared/types'
import { useDataStore } from '@/stores/dataStore'
import type { RecipeMetaUpdate } from '../../shared/messages'

export const addNewRecipe = async (name: string): Promise<number> => {
  const response = await ServerCommunicator.postRequest<{recipeId: number}>("/api/recipes", {name: name})
  const newRecipe = await ServerCommunicator.getRequest<Recipe>("/api/recipes/" + String(response.recipeId))
  useDataStore().addRecipe(newRecipe)
  return response.recipeId
}

export const getAllRecipes = async (): Promise<Recipe []> => {
  return await ServerCommunicator.getRequest<Recipe[]>("/api/recipes")
}

export const getIngredientRecipes = async (recipeId: number) :Promise<IngredientRecipe []> => {
  return await ServerCommunicator.getRequest<IngredientRecipe[]>(`/api/recipes/${recipeId}/ingredients`)
}

export const deleteRecipe = async (id: number) => {
  await ServerCommunicator.deleteRequest("/api/recipes/" + String(id))
  useDataStore().deleteRecipe(id)
}

export const updateRecipe = async (recipe: Recipe) => {
  const metaInfo: RecipeMetaUpdate = {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    servings_per_recipe: recipe.servings_per_recipe,
    instructions: recipe.instructions,
    notes: recipe.notes
  }

  await ServerCommunicator.patchRequest("/api/recipes", {recipeMetaUpdate: metaInfo} )
  const updatedRecipe: Recipe = await ServerCommunicator.getRequest<Recipe>("/api/recipes/" + String(recipe.id))
  useDataStore().updateRecipe(updatedRecipe)
}

import { ServerCommunicator } from '@/services/ServerCommunicator'
import type { Recipe } from '../../shared/types'
import { useDataStore } from '@/stores/dataStore'

export const addNewRecipe = async (name: string): Promise<number> => {
  const response = await ServerCommunicator.postRequest<{recipeId: number}>("/api/recipes", {name: name})
  const newRecipe = await ServerCommunicator.getRequest<Recipe>("/api/recipes/" + String(response.recipeId))
  useDataStore().addRecipe(newRecipe)
  return response.recipeId
}

export const getAllRecipes = async (): Promise<Recipe []> => {
  return await ServerCommunicator.getRequest<Recipe[]>("/api/recipes")
}

export const deleteRecipe = async (id: number) => {
  await ServerCommunicator.deleteRequest("/api/recipes/" + String(id))
  useDataStore().deleteRecipe(id)
}
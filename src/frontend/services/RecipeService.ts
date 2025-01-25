import { ServerCommunicator } from '@/services/ServerCommunicator'
import type { RecipeIngredient, Recipe } from '../../shared/types'
import { useDataStore } from '@/stores/dataStore'
import type { RecipeRequest } from '../../shared/request/RecipeRequests'

export const addNewRecipe = async (name: string): Promise<number> => {
  const response = await ServerCommunicator.postRequest<{recipeId: number}>("/api/recipes", {name: name})
  const newRecipe = await ServerCommunicator.getRequest<Recipe>("/api/recipes/" + String(response.recipeId))
  useDataStore().addRecipe(newRecipe)
  return response.recipeId
}

export const getAllRecipes = async (): Promise<Recipe []> => {
  return await ServerCommunicator.getRequest<Recipe[]>("/api/recipes")
}

export const getRecipeIngredients = async (recipeId: number) :Promise<RecipeIngredient []> => {
  return await ServerCommunicator.getRequest<RecipeIngredient[]>(`/api/recipes/${recipeId}/ingredients`)
}

export const deleteRecipe = async (id: number) => {
  await ServerCommunicator.deleteRequest("/api/recipes/" + String(id))
  useDataStore().deleteRecipe(id)
}

export const updateRecipe = async (recipe: Recipe, ingredients: RecipeIngredient[]) => {
  const request: RecipeRequest = {
    name: recipe.name,
    description: recipe.description,
    servings_per_recipe: Number(recipe.servings_per_recipe),
    instructions: recipe.instructions,
    notes: recipe.notes,
    ingredients: ingredients
  }

  await ServerCommunicator.putRequest("/api/recipes/" + String(recipe.id), request)
  const updatedRecipe: Recipe = await ServerCommunicator.getRequest<Recipe>("/api/recipes/" + String(recipe.id))
  useDataStore().updateRecipe(updatedRecipe)
}

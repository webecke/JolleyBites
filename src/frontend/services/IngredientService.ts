import { useDataStore } from '@/stores/dataStore'
import type { Ingredient } from '../../shared/types'
import { ServerCommunicator } from '@/services/ServerCommunicator'
import type { ClientGeneratedIngredient } from '../../shared/messages'

export const getAllIngredients = async (): Promise<Ingredient []> => {
  return await ServerCommunicator.getRequest<Ingredient[]>("/api/ingredients")
}

const newIngredientPost = async (ingredient: Omit<Ingredient, "id">) => {
  return await ServerCommunicator.postRequest<{id: number}>("/api/ingredients", {ingredient: ingredient})
};

const batchIngredientsPost = async (ingredients: ClientGeneratedIngredient[]) => {
  return await ServerCommunicator.postRequest<{ingredientsIds: []}>("/api/ingredients", {ingredients: ingredients})
}

export const addIngredient = async (ingredient: ClientGeneratedIngredient | null)=> {
  if (ingredient == null) {
    console.error("Tried to add null ingredient");
    throw Error("Tried to add null ingredient")
  } if ((ingredient.name == "") || (ingredient.quantity == 0) || (ingredient.unit == "")) {
    throw Error("Please enter an ingredient name, quantity, and unit")
  }

  const response = await newIngredientPost(ingredient);
  const newIngredient: Ingredient = { ...ingredient, ...response }
  useDataStore().addIngredient(newIngredient)
}

export const addIngredientsBatch = async (ingredients: ClientGeneratedIngredient[]): Promise<{ingredientsIds: []}> => {
  return await batchIngredientsPost(ingredients)
}

export const updateIngredient = async (ingredient: Ingredient)=> {
  await ServerCommunicator.patchRequest("/api/ingredients", {ingredient: ingredient})
  return true;
}

export const deleteIngredients = async (ingredientIds: number[]) => {
  await ServerCommunicator.deleteRequest("/api/ingredients", {ids: ingredientIds})

  useDataStore().deleteIngredients(ingredientIds)
}

function generateBaseUrl() {
  let baseUrl = window.location.origin
  if (baseUrl.startsWith("http://localhost")) {
    baseUrl = "http://localhost:8788"
  }
  return baseUrl
}


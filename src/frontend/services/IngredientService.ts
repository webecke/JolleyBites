import { useDataStore } from '@/stores/dataStore'
import type { Ingredient } from '../../shared/types'
import { ServerCommunicator } from '@/services/ServerCommunicator'
import type { NewIngredientRequest } from '../../shared/request/IngredientRequests'

export const getAllIngredients = async (): Promise<Ingredient []> => {
  return await ServerCommunicator.getRequest<Ingredient[]>("/api/ingredients")
}

export const getIngredient = async (id: number): Promise<Ingredient> => {
  return await ServerCommunicator.getRequest<Ingredient>("/api/ingredients/" + String(id))
}

const newIngredientPost = async (ingredient: NewIngredientRequest) => {
  const ingredientRequest: NewIngredientRequest = {
    name: ingredient.name,
    quantity: Number(ingredient.quantity),
    unit: ingredient.unit,
    purchase_price: Number(ingredient.purchase_price),
    notes: ingredient.notes
  }
  return await ServerCommunicator.postRequest<{ingredientId: number}>("/api/ingredients", ingredientRequest)
};

const batchIngredientsPost = async (ingredients: NewIngredientRequest[]) => {
  return await ServerCommunicator.postRequest<{ingredientsIds: []}>("/api/ingredients", {ingredients: ingredients})
}

export const addIngredient = async (ingredient: NewIngredientRequest | null)=> {
  if (ingredient == null) {
    console.error("Tried to add null ingredient");
    throw Error("Tried to add null ingredient")
  } if ((ingredient.name == "") || (ingredient.quantity == 0) || (ingredient.unit == "")) {
    throw Error("Please enter an ingredient name, quantity, and unit")
  }

  const response = await newIngredientPost(ingredient)
  const newIngredient: Ingredient = await getIngredient(response.ingredientId)
  useDataStore().addIngredient(newIngredient)
}

export const addIngredientsBatch = async (ingredients: NewIngredientRequest[]): Promise<{ingredientsIds: []}> => {
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

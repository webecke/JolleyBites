import { useDataStore } from '@/stores/dataStore'
import type { Ingredient } from '../../shared/types'
import { ServerCommunicator } from '@/services/ServerCommunicator'

export const getAllIngredients = async (): Promise<Ingredient []> => {
  return await ServerCommunicator.getRequest<Ingredient[]>("/api/ingredients")
}

const newIngredientPost = async (ingredient: Omit<Ingredient, "id">) => {
  return await ServerCommunicator.postRequest<{id: number}>("/api/ingredients", {ingredient: ingredient})
};

export const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'price_per_unit' | 'user_id'> | null)=> {
  if (ingredient == null) {
    console.error("Tried to add null ingredient");
    throw Error("Tried to add null ingredient")
  } if ((ingredient.name == "") || (ingredient.quantity == 0) || (ingredient.unit == "")) {
    throw Error("Please enter an ingredient name, quantity, and unit")
  }

  const submittableIngredient = {
    user_id: "GENERIC",
    name: ingredient.name,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    purchase_price: ingredient.purchase_price,
    price_per_unit: (ingredient.purchase_price / ingredient.quantity),
    notes: ingredient.notes
  }

  const response = await newIngredientPost(submittableIngredient);
  const newIngredient: Ingredient = { ...submittableIngredient, ...response }
  useDataStore().addIngredient(newIngredient)
  console.log(useDataStore().ingredients)
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


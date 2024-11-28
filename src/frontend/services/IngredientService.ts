import { useDataStore } from '@/stores/dataStore'
import type { Ingredient } from '../../shared/types'
import { ServerCommunicator } from '@/services/ServerCommunicator'
import type { IngredientRequest } from '../../shared/request/IngredientRequests'

export const getAllIngredients = async (): Promise<Ingredient []> => {
  return await ServerCommunicator.getRequest<Ingredient[]>("/api/ingredients")
}

export const getIngredient = async (id: number): Promise<Ingredient> => {
  return await ServerCommunicator.getRequest<Ingredient>("/api/ingredients/" + String(id))
}

const addIngredientsPost = async (ingredients: IngredientRequest[]) => {
  const ingredientRequests = ingredients.map((ingredient) => {
    return formatIngredientRequest(ingredient)
  })
  return await ServerCommunicator.postRequest<{ingredientIds: number[]}>("/api/ingredients", ingredientRequests)
}

const formatIngredientRequest = (ingredient: IngredientRequest): IngredientRequest => {
  return {
    name: ingredient.name,
    quantity: Number(ingredient.quantity),
    unit: ingredient.unit,
    purchase_price: Number(ingredient.purchase_price),
    notes: ingredient.notes
  }
}

export const addIngredient = async (ingredient: IngredientRequest | null)=> {
  if (ingredient == null) {
    console.error("Tried to add null ingredient");
    throw Error("Tried to add null ingredient")
  } if ((ingredient.name == "") || (ingredient.quantity == 0) || (ingredient.unit == "")) {
    throw Error("Please enter an ingredient name, quantity, and unit")
  }

  const response = await addIngredientsPost([ingredient])
  console.error(response)
  const newIngredient: Ingredient = await getIngredient(response.ingredientIds[0])
  useDataStore().addIngredient(newIngredient)
}

export const addIngredientsBatch = async (ingredients: IngredientRequest[]): Promise<{ingredientIds: number[]}> => {
  return await addIngredientsPost(ingredients)
}

export const updateIngredient = async (ingredientRequest: IngredientRequest, id: number)=> {
  ingredientRequest.quantity = Number(ingredientRequest.quantity)
  ingredientRequest.purchase_price = Number(ingredientRequest.purchase_price)
  await ServerCommunicator.putRequest("/api/ingredients/" + String(id), ingredientRequest)
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

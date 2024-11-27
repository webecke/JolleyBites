import type { Ingredient, User } from '../../shared/types'
import type { DataAccessMachine } from '../dataAccess/dataAccessMachine'
import type { IngredientRequest } from '../../shared/request/IngredientRequests'
import { ServerError } from '../network/ServerError'

export const IngredientService = {
  createIngredient,
  getIngredientsForUser,
  getIngredient,
  deleteSetOfIngredients,
  updateIngredient
}

async function createIngredient(dataAccess: DataAccessMachine, user: User, request: IngredientRequest): Promise<number> {
  try {
    const ingredient: Omit<Ingredient, 'id'> = {
      ...request,
      price_per_unit: request.purchase_price / request.quantity,
      user_id: user.id
    }
    return await dataAccess.getIngredientsDA().insertIngredient(ingredient)
  } catch(error) {
    throw ServerError.internalServerError("Something went wrong inserting ingredient into database", error)
  }
}

async function getIngredientsForUser(dataAccess: DataAccessMachine, user: User): Promise<Ingredient[]> {
  return await dataAccess.getIngredientsDA().getIngredientsForUser(user.id)
}

async function getIngredient(dataAccess: DataAccessMachine, id: number): Promise<Ingredient> {
  return await dataAccess.getIngredientsDA().getIngredientById(id)
}

async function deleteSetOfIngredients(dataAccess: DataAccessMachine, ids: number[]) {
  await dataAccess.getIngredientsDA().deleteIngredientsByIds(ids)
}

async function updateIngredient(
  dataAccess: DataAccessMachine,
  user: User,
  id: number,
  request: IngredientRequest
): Promise<void> {
  try {
    const existing = await dataAccess.getIngredientsDA().getIngredientById(id)
    if (!existing) {
      throw ServerError.notFound("Ingredient not found")
    }
    if (existing.user_id !== user.id) {
      throw ServerError.forbidden("Not authorized to update this ingredient")
    }

    const updatedIngredient: Ingredient = {
      id,
      ...request,
      price_per_unit: request.purchase_price / request.quantity,
      user_id: user.id
    }

    await dataAccess.getIngredientsDA().updateIngredient(updatedIngredient)
  } catch (error) {
    if (error instanceof ServerError) throw error
    throw ServerError.internalServerError("Failed to update ingredient", error)
  }
}

import type { Ingredient, User } from '../../shared/types'
import type { DataAccessMachine } from '../dataAccess/dataAccessMachine'
import type { NewIngredientRequest } from '../../shared/request/IngredientRequests'
import { ServerError } from '../network/ServerError'

export const IngredientService = {
  createIngredient,
  getIngredientsForUser,
  getIngredient,
  deleteSetOfIngredients
}

async function createIngredient(dataAccess: DataAccessMachine, user: User, request: NewIngredientRequest): Promise<number> {
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

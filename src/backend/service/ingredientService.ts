import type { Ingredient, User } from '../../shared/types'
import type { DataAccessMachine } from '../dataAccess/dataAccessMachine'

export const IngredientService = {
  createIngredient,
  getIngredientsForUser
}

function createIngredient() {

}

async function getIngredientsForUser(dataAccess: DataAccessMachine, user: User): Promise<Ingredient[]> {
  const data = await dataAccess.getIngredientsDA().getIngredientsForUser(user.id)
  return data
}

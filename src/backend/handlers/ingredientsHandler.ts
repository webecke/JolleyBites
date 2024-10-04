import { Request as CfRequest } from '@cloudflare/workers-types'
import type { Env } from '../../../functions/requestTools'
import { parseNextApiToken } from '../../../functions/requestTools'
import { IngredientsDataAccess } from '../dataAccess/ingredientsDataAccess'
import type { Ingredient } from '../../shared/types'
import { HttpError } from '../errors/HttpError'


export async function handleIngredientsRequest (path: String, request: CfRequest, env: Env): Promise<Response> {
  const {apiToken, apiPath} = parseNextApiToken(path)

  const requestType = request.method
  const ingredientsDataAccess = new IngredientsDataAccess(env.DB)

  switch (requestType) {

    case "GET":
      if (apiToken == "") {
        return new Response(JSON.stringify(await ingredientsDataAccess.getIngredientsForUser(env.user.id)), { status: 200 });
      }
      const response = await ingredientsDataAccess.getIngredientById(Number(apiToken))
      if (response == null) {
        throw HttpError.notFound("Ingredient not found with id [" + apiToken + "]")
      }
      return new Response(JSON.stringify(response), { status: 200 })

    case "POST":
      const postReqBody: any = await request.json()
      if (!('ingredient' in postReqBody)) {
        throw HttpError.badRequest(`Missing ingredient`);
      }
      const ingredient = validateAndUnpackNewIngredient(postReqBody.ingredient, env)

      let newIngredientId: number
      try {
        newIngredientId = await ingredientsDataAccess.insertIngredient(ingredient)
        console.log(newIngredientId)
      } catch(error) {
        throw HttpError.internalServerError("Something went wrong inserting ingredient into database")
      }
      return new Response(JSON.stringify({ingredientId: newIngredientId}), { status: 201 })

    case "PATCH":
      const patchReqBody: any = await request.json()
      if (!('ingredient' in patchReqBody)) {
        throw HttpError.badRequest(`Missing ingredient`);
      }

      const patchIngredient: Ingredient = validateFullIngredient(patchReqBody.ingredient)
      const success = await ingredientsDataAccess.updateIngredient(patchIngredient)

      if (success) {
        return new Response(JSON.stringify({message: 'success'}),{status: 200})
      } else {
        return new Response(JSON.stringify({message: 'failed'}), { status: 500 })
      }

    case "DELETE":
      const deleteReqBody: any = await request.json()
      if (!('ids' in deleteReqBody)) {
        throw HttpError.badRequest(`Missing ids of ingredients`);
      }
      const deleteSuccess = await ingredientsDataAccess.deleteIngredientsByIds(deleteReqBody.ids)

      if (deleteSuccess) {
        return new Response(JSON.stringify({message: 'success'}),{status: 200})
      } else {
        return new Response(JSON.stringify({message: 'failed'}), { status: 500 })
      }

    default:
      console.error(requestType)
      throw HttpError.methodNotAllowed("None of those work")
  }
}

function validateAndUnpackNewIngredient(data: any, env: Env): Omit<Ingredient, 'id'> {
  const requiredFields: (keyof Omit<Ingredient, 'id' | 'user_id'>)[] = [
    'name', 'quantity', 'unit', 'purchase_price', 'price_per_unit', 'notes'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw HttpError.badRequest(`Missing required field: ${field}`);
    }
  }

  return {
    user_id: env.user.id,
    name: String(data.name),
    quantity: Number(data.quantity),
    unit: String(data.unit),
    purchase_price: Number(data.purchase_price),
    price_per_unit: Number(data.price_per_unit),
    notes: data.notes ? String(data.notes) : ''
  };
}

function validateFullIngredient(data: any): Ingredient {
  const requiredFields: (keyof Ingredient)[] = [
    'id', 'user_id', 'name', 'quantity', 'unit', 'purchase_price', 'price_per_unit', 'notes'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw HttpError.badRequest(`Missing required field: ${field}`);
    }
  }

  return data as Ingredient;
}
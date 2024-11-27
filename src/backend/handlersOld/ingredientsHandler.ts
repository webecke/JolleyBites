import { Request as CfRequest } from '@cloudflare/workers-types'
import type { Env } from '../../../functions/requestTools'
import { parseNextApiToken } from '../../../functions/requestTools'
import { IngredientsDataAccess } from '../dataAccess/ingredientsDataAccess'
import type { Ingredient } from '../../shared/types'
import { ServerError } from '../network/ServerError'
import type { IngredientRequest } from '../../shared/request/IngredientRequests'


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
        throw ServerError.notFound("Ingredient not found with id [" + apiToken + "]")
      } else if (response.user_id != env.user.id) {
        throw ServerError.unauthorized("Ingredient owned by a different user")
      }
      return new Response(JSON.stringify(response), { status: 200 })

    case "POST":
      const postReqBody: any = await request.json()
      if ('ingredient' in postReqBody) {
        const ingredient = validateAndUnpackNewIngredient(postReqBody.ingredient, env)

        console.error("PAY ATTENTION TO ME: ",ingredient)

        let newIngredientId: number
        try {
          newIngredientId = await ingredientsDataAccess.insertIngredient(ingredient)
        } catch(error) {
          throw ServerError.internalServerError("Something went wrong inserting ingredient into database", error)
        }
        return new Response(JSON.stringify({ingredientId: newIngredientId}), { status: 201 })

      } else if ('ingredients' in postReqBody) {
        const ingredients: Omit<Ingredient, 'id'>[] = validateAndUnpackBatchOfNewIngredients(postReqBody.ingredients, env)

        let newIngredientsIds: number[]
        try{
          newIngredientsIds = await ingredientsDataAccess.insertBatchIngredients(ingredients)
        } catch (error) {
          throw ServerError.internalServerError("Something went wrong inserting ingredient batch into database", error)
        }
        return new Response(JSON.stringify({ingredientsIds: newIngredientsIds}), {status:201})

      } else {
        throw ServerError.badRequest(`Missing ingredient or batch of ingredients`);
      }

    case "PATCH":
      const patchReqBody: any = await request.json()
      if (!('ingredient' in patchReqBody)) {
        throw ServerError.badRequest(`Missing ingredient`);
      }

      const patchIngredient: Ingredient = await validateFullIngredient(patchReqBody.ingredient, env)
      const success = await ingredientsDataAccess.updateIngredient(patchIngredient)

      if (success) {
        return new Response(JSON.stringify({message: 'success'}),{status: 200})
      } else {
        return new Response(JSON.stringify({message: 'failed'}), { status: 500 })
      }

    case "DELETE":
      const deleteReqBody: any = await request.json()
      if (!('ids' in deleteReqBody)) {
        throw ServerError.badRequest(`Missing ids of ingredients`);
      }
      const deleteSuccess = await ingredientsDataAccess.deleteIngredientsByIds(deleteReqBody.ids)

      if (deleteSuccess) {
        return new Response(JSON.stringify({message: 'success'}),{status: 200})
      } else {
        return new Response(JSON.stringify({message: 'failed'}), { status: 500 })
      }

    default:
      console.error(requestType)
      throw ServerError.methodNotAllowed("None of those work")
  }
}

function validateAndUnpackBatchOfNewIngredients(data: any, env: Env): Omit<Ingredient, 'id'>[] {
  console.error(data)
  if (data.length == 0) {
    throw ServerError.badRequest("No ingredients found in request")
  }

  const ingredients: Omit<Ingredient, 'id'>[] = []
  data.forEach((item: Omit<Ingredient, 'id'>) => {
    ingredients.push(validateAndUnpackNewIngredient(item, env))
  })

  return ingredients
}

function validateAndUnpackNewIngredient(data: any, env: Env): Omit<Ingredient, 'id'> {
  const requiredFields: (keyof IngredientRequest)[] = [
    'name', 'quantity', 'unit', 'purchase_price', 'notes'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw ServerError.badRequest(`Missing required field: ${String(field)}`);
    }
  }

  if (data.quantity <= 0) {
    throw ServerError.badRequest("Ingredient must have quantity > 0")
  }

  return {
    user_id: env.user.id,
    name: String(data.name),
    quantity: Number(data.quantity),
    unit: String(data.unit),
    purchase_price: Number(data.purchase_price),
    price_per_unit: Number(data.purchase_price) / Number(data.quantity),
    notes: data.notes ? String(data.notes) : ''
  };
}

async function validateFullIngredient(data: any, env: Env): Promise<Ingredient> {
  const requiredFields: (keyof Ingredient)[] = [
    'id', 'user_id', 'name', 'quantity', 'unit', 'purchase_price', 'price_per_unit', 'notes'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw ServerError.badRequest(`Missing required field: ${field}`);
    }
  }

  console.error(data)
  const ingredientInQuestion: Ingredient = await env.dataAccess.getIngredientsDA().getIngredientById(data.id)
  if (ingredientInQuestion.user_id != env.user.id) {
    throw ServerError.forbidden("This ingredient doesn't belong to you")
  }

  data.user_id = env.user.id

  return data as Ingredient;
}

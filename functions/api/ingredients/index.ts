// /api/ingredients

import { Env } from '../_middleware'
import { ServerError } from '@backend/network/ServerError'
import { IngredientService } from '@backend/service/ingredientService'
import type { EventContext } from '@cloudflare/workers-types'
import { ServerContext } from '@backend/network/handlerContexts'
import { isValidIngredientRequest } from '@shared/request/IngredientRequests'
import { Ingredient } from '@shared/types'

export const onRequest = async (context: EventContext<Env, any, ServerContext>) => {
  if (context.request.method === 'GET') {
    const ingredients: Ingredient[] = await IngredientService.getIngredientsForUser(context.env.dataAccess, context.data.user)
    return Response.json(ingredients)
  }

  else if (context.request.method === 'POST') {
    const request = await context.request.json()

    if (!isValidIngredientRequest(request))
      throw ServerError.badRequest("Bad Ingredient Request")
    const newId = await IngredientService.createIngredient(context.env.dataAccess, context.data.user, request)
    return new Response(JSON.stringify({ingredientId: newId}), { status: 201 })
  }

  else if (context.request.method === 'DELETE') {
    const request: any = await context.request.json()
    if (!('ids' in request)) {
      throw ServerError.badRequest(`Missing ids of ingredients`);
    } if (!Array.isArray(request.ids)) {
      throw ServerError.badRequest('Bad list of ids')
    }

    await IngredientService.deleteSetOfIngredients(context.env.dataAccess ,request.ids)
    return new Response(null, {status: 204})
  }

  throw ServerError.methodNotAllowed("/api/ingredients expects GET or POST")
}

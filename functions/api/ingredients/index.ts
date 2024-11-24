// /api/ingredients

import { Env } from '../_middleware'
import { ServerError } from '@backend/network/ServerError'
import { IngredientService } from '@backend/service/ingredientService'
import type { EventContext } from '@cloudflare/workers-types'
import { ServerContext } from '@backend/network/handlerContexts'

export const onRequest = async (context: EventContext<Env, any, ServerContext>) => {
  if (context.request.method === 'GET') {
    const ingredients = await IngredientService.getIngredientsForUser(context.env.dataAccess, context.data.user)
    return Response.json(ingredients)
  }

  throw ServerError.methodNotAllowed("/api/ingredients expects GET")
}

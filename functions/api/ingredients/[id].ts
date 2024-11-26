// /api/ingredients/[id]

import { Env } from '../_middleware'
import { ServerError } from '@backend/network/ServerError'
import { IngredientService } from '@backend/service/ingredientService'
import type { EventContext } from '@cloudflare/workers-types'
import { ServerContext } from '@backend/network/handlerContexts'
import { Ingredient } from '@shared/types'

export const onRequest = async (context: EventContext<Env, any, ServerContext>) => {
  const id: number = Number(context.params.id)
  if (isNaN(id)) throw ServerError.badRequest("id must be a number")

  if (context.request.method === 'GET') {
    const ingredient: Ingredient = await IngredientService.getIngredient(context.env.dataAccess, id)
    if (ingredient.user_id != context.data.user.id) throw ServerError.unauthorized("Ingredient belongs to a different user")

    return Response.json(ingredient)
  }

  throw ServerError.methodNotAllowed("/api/ingredients/[id] expects GET or POST")
}

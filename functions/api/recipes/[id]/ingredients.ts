// /api/recipes/[id]/ingredients

import type { EventContext } from '@cloudflare/workers-types'
import { Env } from '../../_middleware'
import { ServerContext } from '@backend/network/handlerContexts'
import { ServerError } from '@backend/network/ServerError'
import { RecipeService } from '@backend/service/RecipeService'

export const onRequest = async (context: EventContext<Env, any, ServerContext>) => {
  const id: number = Number(context.params.id)
  if (isNaN(id)) throw ServerError.badRequest("id must be a number")

  if (context.request.method === 'GET') {
    const recipeIngredients = await RecipeService.getIngredientsForRecipe(context.env.dataAccess, context.data.user, id)
    return Response.json(recipeIngredients)
  }

  throw ServerError.methodNotAllowed("/api/recipes/[id]/ingredients accepts GET")
}

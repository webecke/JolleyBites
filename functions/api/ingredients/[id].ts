// /api/ingredients/[id]

import { Env } from '../_middleware'
import { ServerError } from '@backend/network/ServerError'
import { IngredientService } from '@backend/service/IngredientService'
import type { EventContext } from '@cloudflare/workers-types'
import { ServerContext } from '@backend/network/handlerContexts'
import { Ingredient } from '@shared/types'
import { isValidIngredientRequest } from '@shared/request/IngredientRequests'

export const onRequest = async (context: EventContext<Env, any, ServerContext>) => {
  const id: number = Number(context.params.id)
  if (isNaN(id)) throw ServerError.badRequest("id must be a number")

  if (context.request.method === 'GET') {
    const ingredient: Ingredient = await IngredientService.getIngredient(context.env.dataAccess, context.data.user, id)
    return Response.json(ingredient)
  }

  else if (context.request.method === 'PUT') {
    if (isNaN(id)) {
      throw ServerError.badRequest("Invalid ingredient ID")
    }

    const request = await context.request.json()
    console.log("POTATO", request)
    if (!isValidIngredientRequest(request)) {
      throw ServerError.badRequest("Bad Ingredient Request")
    }

    await IngredientService.updateIngredient(context.env.dataAccess, context.data.user, id, request)
    return new Response(null, { status: 204 })
  }

  throw ServerError.methodNotAllowed("/api/ingredients/[id] expects GET or PUT")
}

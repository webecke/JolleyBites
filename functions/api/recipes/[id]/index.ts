// /api/recipes/[id]

import type { EventContext } from '@cloudflare/workers-types'
import { Env } from '../../_middleware'
import { ServerContext } from '@backend/network/handlerContexts'
import { ServerError } from '@backend/network/ServerError'
import { Recipe } from '@shared/types'
import { RecipeService } from '@backend/service/RecipeService'
import { isValidRecipeRequest } from '@shared/request/RecipeRequests'

export const onRequest = async (context: EventContext<Env, any, ServerContext>) => {
  const id: number = Number(context.params.id)
  if (isNaN(id)) throw ServerError.badRequest("id must be a number")

  if (context.request.method === 'GET') {
    const recipe: Recipe = await RecipeService.getRecipeById(context.env.dataAccess, context.data.user, id)
    return Response.json(recipe)
  }

  else if (context.request.method === 'DELETE') {
    await RecipeService.deleteRecipe(context.env.dataAccess, context.data.user, id)
    return new Response(null, { status: 204 })
  }

  else if (context.request.method === 'PUT') {
    const request = await context.request.json()

    console.error(request)

    if (!isValidRecipeRequest(request)) throw ServerError.badRequest("Bad Recipe Request")

    await RecipeService.updateRecipe(context.env.dataAccess, context.data.user, id, request)

    return new Response(null, { status: 204 })
  }

  throw ServerError.methodNotAllowed("/api/recipes/[id] accepts GET and DELETE only")
}

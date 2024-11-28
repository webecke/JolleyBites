// /api/recipes

import type { EventContext } from '@cloudflare/workers-types'
import { Env } from '../_middleware'
import { ServerContext } from '@backend/network/handlerContexts'
import { ServerError } from '@backend/network/ServerError'
import { RecipeService } from '@backend/service/RecipeService'

export const onRequest = async (context: EventContext<Env, any, ServerContext>) => {
  if (context.request.method === 'POST') {
    const reqBody: any = await context.request.json()

    if ('name' in reqBody) {
      const recipeId = await RecipeService.createRecipe(context.env.dataAccess, context.data.user, reqBody.name)
      return new Response(JSON.stringify({recipeId: recipeId}), {status: 201})
    } else {
      throw ServerError.badRequest(`Missing name for new recipe`);
    }
  }

  else if (context.request.method === 'GET') {
    const response = await RecipeService.getRecipesForUser(context.env.dataAccess, context.data.user)
    return new Response(JSON.stringify(response))
  }
}

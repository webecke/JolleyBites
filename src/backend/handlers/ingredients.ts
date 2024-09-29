import type { Env } from './worker'

export async function handleIngredientsRequest(path: String, request: Request, env: Env): Promise<Response> {
 return new Response("snakes")
}

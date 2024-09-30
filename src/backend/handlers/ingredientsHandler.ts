import type { Env } from '../defaultWorker'
import { Request as CfRequest } from '@cloudflare/workers-types';


export function handleIngredientsRequest (path: String, request: CfRequest, env: Env): Response {
  return new Response("YOU CALLED THE INGREDIENTS API", { status: 418 })
}
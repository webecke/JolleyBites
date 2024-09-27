import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): 
Promise<Response> {
    try {
      // Example of using D1
      const { results } = await env.DB.prepare("SELECT * FROM my_table").all();
      
      // Serve static assets
      return await getAssetFromKV({
        request,
        waitUntil: ctx.waitUntil.bind(ctx),
      })
    } catch (e) {
      return new Response("Error: " + (e as Error).message)
    }
  },
}

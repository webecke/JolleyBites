import { potatoes } from './services/testService'

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext):
    Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname; // Extract the path from the URL

      switch (path) {
        case '/':
          return new Response("Hey look at that, you called the generic endpoint: " + potatoes())
        case '/cheese':
          return new Response("Ahhhh, I like cheese too", { status: 418 })
        case '/bread':
          return new Response("Good idea", { status: 201 })
        default:
          return new Response('404 Not Found', { status: 404 });
      }
    } catch (e) {
      return new Response("Error: " + (e as Error).message)
    }
  },
}

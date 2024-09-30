import { EventContext, D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequest = async (
  context: EventContext<Env, any, Record<string, unknown>>
): Promise<Response> => {

  return new Response('Hello from Cloudflare Workers! This is code that I, myself wrote. This is the API endpoint');
};
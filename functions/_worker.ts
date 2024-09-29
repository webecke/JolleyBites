//import fetch, { handleRequest } from 'src/backend/handlers/worker.ts'

export default {
  async fetch(request, env, ctx) {
    //return addCorsHeaders(new Response("THIS WORKS BROOOO", {status: 200}), request.headers.get('Origin'))
    //return handleRequest(request, env, ctx);
    return new Response("Test")
  },
};
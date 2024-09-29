import { HttpError } from './worker'
import type { Env } from './worker'
import { handleIngredientsRequest } from './ingredients'

export async function handleApiRoutes(path: String, request: Request, env: Env): Promise<Response> {
  // This code assumes path has removed the preceding /api/

  // Check authentication first
  if (!(await isAuthenticated(request, env))) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Parse the API path
  const apiToken = path.split("/")[0]
  const apiPath = path.substring(apiToken.length + 1);

  switch (apiToken) {
    case 'ingredients':
      return await handleIngredientsRequest(apiPath, request, env)
    case '':
      throw HttpError.teapot("I don't actually do anything. Add more to the request URL to actually get me to do something")
    default:
      throw HttpError.notFound('404 Not Found');
  }
}

function isAuthenticated(request: Request, env: Env)  {
  return true
}
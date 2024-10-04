import { D1Database, Request as CfRequest } from '@cloudflare/workers-types'
import type { User } from '../src/shared/types'
import type { DataAccessMachine } from '../src/backend/dataAccess/dataAccessMachine'

export interface Env {
  DB: D1Database
  user: User
  dataAccessMachine: DataAccessMachine
}

export function parseNextApiToken(path: String) {
  const apiToken = path.split("/")[0]
  const apiPath = path.substring(apiToken.length + 1);
  return {
    apiToken: apiToken,
    apiPath: apiPath
  }
}

export function addCorsHeaders(response: Response, origin: string | null): Response {
  const allowedOrigins = ['http://localhost:5173', 'https://jolleybites.webecke.dev']; // Add your allowed origins

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  } else {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}


export function handleCors(request: CfRequest): Response {
  const origin = request.headers.get('Origin') || '';

  const response = new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, PUT, PATCH, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    }
  });

  return response;
}

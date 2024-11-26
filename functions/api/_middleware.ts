import { ServerContext } from '@backend/network/handlerContexts'
import type { EventContext } from "@cloudflare/workers-types";
import { D1Database } from '@cloudflare/workers-types'
import { DataAccessMachine } from '@backend/dataAccess/dataAccessMachine'
import { ServerError } from '@backend/network/ServerError'
import { AuthTokenPayload, verifyToken } from '@backend/utils/authTokenUtils'
import { UserDataAccess } from '@backend/dataAccess/userDataAccess'
import { User } from '@shared/types'

export interface Env {
  DB: D1Database
  dataAccess: DataAccessMachine
}

const timeAndLogMiddleware = async (context: EventContext<Env, any, ServerContext>) => {
  const startTime = Date.now()

  let response: Response;
  try {
    // it really is Response, vue just gets confused and will show an error
    // context.next() triggers the next middleware or handler
    response = await context.next() as unknown as Response
  } catch (e) {
    const endTime = Date.now()
    const timeElapsed = endTime - startTime
    if (e instanceof ServerError) {
      console.error(`${context.request.method} request to ${context.request.url} failed in ${timeElapsed} milliseconds with code ${e.statusCode}. [${e.message}]`)
      if (e.cause) console.error("Cause:", e.cause.stack)
      return new Response(JSON.stringify({ message: `Error: ${e.message}` }),
                          { status: e.statusCode, statusText: e.httpCodeMessage, headers: { 'Content-Type': 'application/json' } })
    }
    console.error(`${context.request.method} request to ${context.request.url} failed in ${timeElapsed} milliseconds for an unknown reason. [${e}]`)
    return new Response(JSON.stringify({ message: "Error: Something went terrible wrong" }), { status: 500, statusText: "Unknown Internal Server Error", headers: { 'Content-Type': 'application/json' }})
  }

  const endTime = Date.now()
  const timeElapsed = endTime - startTime

  console.log(`${context.request.method} request to ${context.request.url} completed in ${timeElapsed} milliseconds with code ${response.status}`)

  return response
}

const corsMiddleware = async (context: EventContext<Env, any, ServerContext>) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://jolleybites.webecke.dev'
  ];

  const origin = context.request.headers.get('Origin');
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',  // Added this
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = await context.next();

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true'  // Added this
  };

  const newHeaders = {
    ...Object.fromEntries(response.headers.entries()),
    ...corsHeaders
  };

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
};

const authMiddleware = async (context: EventContext<Env, any, ServerContext>) => {
  const authorization: string | null = context.request.headers.get('Authorization')

  if (authorization == null) { throw ServerError.badRequest("No authToken provided")}

  const authTokenPayload: AuthTokenPayload | null = await verifyToken(authorization)

  if (authTokenPayload == null) { throw ServerError.unauthorized("Invalid authToken")}

  const userDataAccess: UserDataAccess = context.env.dataAccess.getUserDA()

  const user: User | null = await userDataAccess.getUserById(authTokenPayload.user_id)

  if (user == null) {
    throw ServerError.unauthorized("Invalid authToken")
  }

  context.data.user = user

  return context.next()
}

const dataMiddleware = async (context: EventContext<Env, any, ServerContext>) => {
  context.env.dataAccess = new DataAccessMachine(context.env.DB)
  return await context.next()
}


export const onRequest = [
  corsMiddleware,
  timeAndLogMiddleware,
  dataMiddleware,
  authMiddleware,
]

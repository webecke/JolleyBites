import { AppContext } from '../../src/backend/network/handlerContexts'
import type { EventContext } from "@cloudflare/workers-types";
import { D1Database } from '@cloudflare/workers-types'
import type { DataAccessMachine } from '../../src/backend/dataAccess/dataAccessMachine'
import { ServerError } from '../../src/backend/network/ServerError'

export interface Env {
  DB: D1Database
  dataAccess: DataAccessMachine
}

const timeAndLogMiddleware = async (context: EventContext<Env, any, AppContext>) => {
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

const corsMiddleware = async (context: EventContext<Env, any, AppContext>) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        // Use plain object instead of Headers
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const response = await context.next()

  // Convert Headers to plain object
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  }

  const newHeaders = {
    ...Object.fromEntries(response.headers.entries()),
    ...corsHeaders
  }

  // it really is a bodyinit, just vue for some reason thinks it should be yelling here
  return new Response(response.body as unknown as BodyInit, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders  // Plain object works with both
  })
}

export const onRequest = [
  timeAndLogMiddleware,
  corsMiddleware,
]

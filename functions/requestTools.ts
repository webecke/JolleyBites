import { D1Database } from '@cloudflare/workers-types'

export interface Env {
  DB: D1Database;
}

export function parseNextApiToken(path: String) {
  const apiToken = path.split("/")[0]
  const apiPath = path.substring(apiToken.length + 1);
  return {
    apiToken: apiToken,
    apiPath: apiPath
  }
}

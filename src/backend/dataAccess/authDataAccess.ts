import type { User } from '../../shared/types'
import { v4 as uuid } from 'uuid'
import { HttpError } from '../errors/HttpError'
import { MILLISECONDS_TO_LIVE } from '../utils/authTokenUtils'

export class AuthDataAccess {
  private DB: D1Database

  constructor(DB: D1Database) {
    this.DB = DB
  }

  public async insertToken(authToken: string, userId: string): Promise<string> {
    const now: Date = new Date(Date.now())
    const expire: Date = new Date(now.getTime() + MILLISECONDS_TO_LIVE);
    try {
      const statement = await this.DB.prepare(`
          INSERT INTO users (token_value, user_id, issued_at, expires_at)
          VALUES (?, ?, ?, ?)
      `).bind(
        authToken,
        userId,
        now.toISOString(),
        expire.toISOString()
      );

      const result = await statement.run();

      return expire.toISOString()
    } catch (error) {
      console.error("Database error:", error);
      throw HttpError.internalServerError("Failed to insert authToken");
    }
  }
}
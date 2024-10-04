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
          INSERT INTO auth (token_value, user_id, issued_at, expires_at)
          VALUES (?, ?, ?, ?)
      `).bind(
        authToken,
        userId,
        now.toISOString(),
        expire.toISOString()
      );

      await statement.run();

      return expire.toISOString()
    } catch (error) {
      console.error("Database error:", error);
      throw HttpError.internalServerError("Failed to insert authToken");
    }
  }

  public async deleteToken(authToken: string) {
    try {
      const statement = await this.DB.prepare(`
          DELETE FROM auth WHERE token_value = ?;
      `).bind(
        authToken
      );

      await statement.run();

      return
    } catch (error) {
      console.error("Database error:", error);
      throw HttpError.internalServerError("Failed to delete authToken");
    }
  }
}
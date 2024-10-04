import { HttpError } from '../errors/HttpError'
import { MILLISECONDS_TO_LIVE } from '../utils/authTokenUtils'
import { D1Database } from '@cloudflare/workers-types';

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

  public async deleteTokensExpiredAtTime(isoTime: string) {
    try {
      const statement = await this.DB.prepare(`
        DELETE FROM auth WHERE expires_at < ?;
      `).bind(
        isoTime
      );

      await statement.run()

      return
    }
    catch (error) {
      console.error("Database error:", error);
      throw HttpError.internalServerError("Failed to delete authToken");
    }
  }

  public async isTokenInTableAndNotExpired(token_value: string, isoTime: string): Promise<boolean> {
    try {
      const currentTime = new Date().toISOString();
      const statement = await this.DB.prepare(`
      SELECT COUNT(*) as count
      FROM auth
      WHERE token_value = ?
      AND expires_at > ?;
    `).bind(
        token_value,
        isoTime
      );

      const result:Record<string, null> | null = await statement.first();
      if (result == null) { return false; }
      return true;
    }
    catch (error) {
      console.error("Database error:", error);
      throw HttpError.internalServerError("Failed to check token validity");
    }
  }
}
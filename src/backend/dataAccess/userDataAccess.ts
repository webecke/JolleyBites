import type { Ingredient, User } from '../../shared/types'
import { HttpError } from '../errors/HttpError'
import { v4 as uuid } from 'uuid'

export class UserDataAccess {
  private DB: D1Database

  constructor(DB: D1Database) {
    this.DB = DB
  }

  public async insertUser(user: Omit<User, 'id'>, hashed_password: string): Promise<string> {
    const id = uuid()
    try {
      const statement = await this.DB.prepare(`
      INSERT INTO users (id, name, email, hashed_password, created_at, password_changed_at, last_login)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
        id,
        user.name,
        user.email,
        hashed_password,
        user.created_at,
        user.password_changed_at,
        user.last_login
      );

      const result = await statement.run();

      return id
    } catch (error) {
      console.error("Database error:", error);
      throw HttpError.internalServerError("Failed to insert user");
    }
  }

  public async getUserById(id: string) {
    try {
      const { results } = await this.DB.prepare(
        "SELECT * FROM users WHERE id = ?"
      ).bind(id).all();

      return results[0] as User;
    } catch (error) {
      console.error("Database error:", error);
      throw HttpError.internalServerError("Failed to fetch user");
    }
  }
}
import type { User } from '../../shared/types'
import { ServerError } from '../network/ServerError'
import { v4 as uuid } from 'uuid'
import { D1Database } from '@cloudflare/workers-types';

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
        user.email.toLowerCase(),
        hashed_password,
        user.created_at,
        user.password_changed_at,
        user.last_login
      );

      const result = await statement.run();

      return id
    } catch (error) {
      console.error("Database error:", error);
      throw ServerError.internalServerError("Failed to insert user");
    }
  }

  public async getUserById(id: string): Promise<User | null> {
    try {
      const { results } = await this.DB.prepare(
        "SELECT * FROM users WHERE id = ?"
      ).bind(id).all();

      return results[0] as User | null;
    } catch (error) {
      console.error("Database error:", error);
      throw ServerError.internalServerError("Failed to fetch user by id");
    }
  }

  public async getUserByEmail(email: string) {
    try {
      const { results } = await this.DB.prepare(
        "SELECT * FROM users WHERE email = ?"
      ).bind(email.toLowerCase()).all();

      if (results.length === 0) {
        return null; // No user found with the given email
      }

      return results[0] as User;
    } catch (error) {
      console.error("Database error:", error);
      throw ServerError.internalServerError("Failed to fetch user by email");
    }
  }

  public async getPasswordHashByEmail(email: string):Promise<string | null> {
    try {
      const { results } = await this.DB.prepare(
        "SELECT hashed_password FROM users WHERE email = ?"
      ).bind(email.toLowerCase()).all();

      if (results.length === 0) {
        return null; // No user found with the given email
      }

      return results[0].hashed_password as string;
    } catch (error) {
      console.error("Database error:", error);
      throw ServerError.internalServerError("Failed to fetch user by email");
    }
  }

}

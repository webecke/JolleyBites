import type { Ingredient } from '../../shared/types'
import { HttpError } from '../handlers/worker'

export class IngredientsDataAccess {
  private DB: D1Database
  constructor(DB: D1Database) {
    this.DB = DB
  }

  public async getIngredientsForUser(userId: String) {
    try {
      const { results } = await this.DB.prepare(
        "SELECT * FROM ingredients WHERE user_id = ?"
      ).bind(userId).all();

      return results as Ingredient[];
    } catch (error) {
      console.error("Database error:", error);
      throw HttpError.internalServerError("Failed to fetch ingredients");
    }
  }

  public async insertIngredient(ingredient: Omit<Ingredient, 'id'>) {
    try {
      const statement = await this.DB.prepare(`
      INSERT INTO ingredients (user_id, name, quantity, unit, purchase_price_cents, price_per_unit_cents, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
        ingredient.user_id,
        ingredient.name,
        ingredient.quantity,
        ingredient.unit,
        ingredient.purchasePrice,
        ingredient.pricePerUnit,
        ingredient.notes
      );

      const result = await statement.first();
      //
      // if (!result || !('id' in result)) {
      //   throw new Error('Failed to insert ingredient' + JSON.stringify(result));
      // }
    } catch (error) {
      console.error("Database error:", error);
      throw HttpError.internalServerError("Failed to insert ingredient");
    }
  }
}
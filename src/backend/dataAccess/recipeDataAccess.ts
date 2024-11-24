import { D1Database } from '@cloudflare/workers-types'
import type { Recipe } from '../../shared/types'
import { ServerError } from '../network/ServerError'

export class RecipeDataAccess {
  private DB: D1Database

  constructor(DB: D1Database) {
    this.DB = DB
  }

  public async insertNewRecipe(name: string, user_id: string): Promise<number> {
    const now: string = new Date(Date.now()).toISOString()

    try {
      const statement = await this.DB.prepare(`
          INSERT INTO recipes (user_id, name, description, servings_per_recipe, calculated_cost, instructions,
                                   notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user_id,
        name,
        "",
        0,
        0,
        "",
        "",
        now,
        now,
      );

      const result = await statement.run();

      if (result && typeof result.meta?.last_row_id === 'number') {
        return result.meta.last_row_id;
      } else {
        throw new Error('Failed to retrieve the inserted ID');
      }
    } catch (error) {
      console.error("Database error:", error);
      throw ServerError.internalServerError("Failed to insert new recipe");
    }
  }

  public async getRecipesForUser(userId: String):Promise<Recipe[]> {
    try {
      const { results } = await this.DB.prepare(
        "SELECT * FROM recipes WHERE user_id = ?"
      ).bind(userId).all();

      return results as Recipe[];
    } catch (error) {
      console.error("Database error:", error);
      throw ServerError.internalServerError("Failed to fetch recipes");
    }
  }

  public async getRecipeById(id: number):Promise<Recipe> {
    try {
      const { results } = await this.DB.prepare(
        "SELECT * FROM recipes WHERE id = ?"
      ).bind(id).all();

      return results[0] as Recipe;
    } catch (error) {
      console.error("Database error:", error);
      throw ServerError.internalServerError("Failed to fetch recipe");
    }
  }

  public async deleteRecipeById(id: number):Promise<void> {
    try {
      const { results } = await this.DB.prepare(
        "DELETE FROM recipes WHERE id = ?"
      ).bind(id).run();

      return;
    } catch (error) {
      console.error("Database error:", error);
      throw ServerError.internalServerError("Failed to delete recipe");
    }
  }

  public async updateRecipe(recipe: Recipe): Promise<boolean> {
    try {
      const statement = await this.DB.prepare(`
      UPDATE recipes
      SET name = ?, description = ?, servings_per_recipe = ?, calculated_cost = ?, instructions = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `).bind(
        recipe.name,
        recipe.description,
        recipe.servings_per_recipe,
        recipe.calculated_cost,
        recipe.instructions,
        recipe.notes,
        recipe.updated_at.toISOString(),
        recipe.id
      );

      const result = await statement.run();

      if (result && result.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Database error:", error);
      throw ServerError.internalServerError("Failed to update recipe");
    }
  }
}

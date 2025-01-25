import type { RecipeIngredient } from '../../shared/types'
import { D1Database } from '@cloudflare/workers-types';

export class RecipeIngredientDataAccess {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async updateOrInsert(ingredient: RecipeIngredient): Promise<void> {
    await this.db
      .prepare(
        `
            INSERT INTO recipe_ingredients (
                recipe_id,
                ingredient_id,
                quantity_in_recipe,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, datetime('now'), datetime('now'))
                ON CONFLICT (recipe_id, ingredient_id) DO UPDATE SET
                quantity_in_recipe = excluded.quantity_in_recipe,
                updated_at = datetime('now');
        `,
      )
      .bind(
        ingredient.recipe_id,
        ingredient.ingredient_id,
        ingredient.quantity_in_recipe,
      )
      .first<RecipeIngredient>();
    return;
  }

  async getByRecipeId(recipeId: number, userId: string): Promise<RecipeIngredient[]> {
    const ingredients = await this.db
      .prepare(
        `SELECT
             recipe_id,
             ingredient_id,
             quantity_in_recipe
         FROM recipe_ingredients
         WHERE recipe_id = ?`
      )
      .bind(recipeId)
      .all<RecipeIngredient>();

    // If results doesn't exist, this could indicate a more serious DB issue
    if (!ingredients.results) {
      throw new Error('Database query failed to return results property');
    }

    const recipeExists = await this.db
      .prepare('SELECT 1 FROM recipes WHERE id = ? AND user_id = ?')
      .bind(recipeId, userId)
      .first();

    if (!recipeExists) {
      throw new Error('Recipe not found or belongs to a different user');
    }

    if (ingredients.results.length > 0) {
      return ingredients.results;
    }

    return [];
  }

  async deleteIngredientsNotInList(recipeId: number, keepIngredientIds: number[]): Promise<void> {
    // If there are no ingredients to keep, delete all ingredients for this recipe
    if (keepIngredientIds.length === 0) {
      await this.db
        .prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?')
        .bind(recipeId)
        .run();
      return;
    }

    // Create the correct number of parameter placeholders
    const placeholders = keepIngredientIds.map(() => '?').join(',');

    // First parameter is recipeId, followed by all keepIngredientIds
    await this.db
      .prepare(
        `DELETE FROM recipe_ingredients
         WHERE recipe_id = ?
           AND ingredient_id NOT IN (${placeholders})`
      )
      .bind(recipeId, ...keepIngredientIds)
      .run();
  }
}

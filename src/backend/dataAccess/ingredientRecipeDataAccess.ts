import type { IngredientForRecipe, IngredientRecipe } from '../../shared/types'

export class IngredientRecipeDataAccess {
  db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async create(ingredient: IngredientForRecipe): Promise<IngredientForRecipe> {
    const result = await this.db
      .prepare(
        `
            INSERT INTO recipe_ingredients (user_id, recipe_id, ingredient_id, quantity_in_recipe, notes, created_at,
                                            updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now')) RETURNING *
        `,
      )
      .bind(
        ingredient.user_id,
        ingredient.recipe_id,
        ingredient.ingredient_id,
        ingredient.quantity_in_recipe,
        ingredient.notes,
      )
      .first<IngredientForRecipe>();
    if (!result) throw new Error('Failed to create recipe ingredient');
    return result;
  }

  async getByRecipeId(recipeId: number, userId: string): Promise<IngredientRecipe[]> {
    const ingredients = await this.db
      .prepare(
        `SELECT 
                  recipe_id,
                  ingredient_id,
                  quantity_in_recipe,
                  notes
               FROM recipe_ingredients
               WHERE recipe_id = ?
               AND user_id = ?`
      )
      .bind(recipeId, userId)
      .all<IngredientRecipe>();

    if (!ingredients.results.length) {
    const recipeExists = await this.db
      .prepare('SELECT 1 FROM recipes WHERE id = ? AND user_id = ?')
      .bind(recipeId, userId)
      .first();

    if (!recipeExists) {
      throw new Error('Recipe not found');
    }
  }

  return ingredients.results;
  }
}

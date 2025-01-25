import type { RecipeIngredient } from '../types'

export type RecipeRequest = {
  name: string,
  description: string,
  servings_per_recipe: number,
  instructions: string,
  notes: string,
  ingredients: RecipeIngredient[]
}

export function isValidIngredientRecipe(recipe: unknown): recipe is RecipeIngredient {
  if (typeof recipe !== 'object' || recipe === null) return false;

  // Type assert to access properties safely
  const r = recipe as Record<string, unknown>;

  if (typeof r.recipe_id !== 'number' || isNaN(r.recipe_id)) {console.error("recipe_id"); return false;}
  if (typeof r.ingredient_id !== 'number' || isNaN(r.ingredient_id)) {console.error("ingredient_id"); return false;}
  if (typeof r.quantity_in_recipe !== 'number' || isNaN(r.quantity_in_recipe)) {console.error("quantity"); return false;}

  // Check numeric constraints
  return r.quantity_in_recipe >= 0;
}

// Updated RecipeRequest type guard
export function isValidRecipeRequest(request: unknown): request is RecipeRequest {
  if (typeof request !== 'object' || request === null) return false;

  // Type assert to access properties safely
  const r = request as Record<string, unknown>;

  if (typeof r.name !== 'string' || r.name.trim() === '') {console.error("name"); return false;}
  if (typeof r.description !== 'string') {console.error("description"); return false;}
  if (typeof r.servings_per_recipe !== 'number' || isNaN(r.servings_per_recipe)) {console.error("servings"); return false;}
  if (typeof r.instructions !== 'string') {console.error("instructions"); return false;}
  if (typeof r.notes !== 'string') {console.error("notes"); return false;}

  // Check ingredients array
  if (!Array.isArray(r.ingredients)) {console.error("ingredients is not an array"); return false;}
  if (!r.ingredients.every(isValidIngredientRecipe)) {console.error("invalid ingredient"); return false;}

  // Check numeric constraints
  return r.servings_per_recipe >= 1;
}

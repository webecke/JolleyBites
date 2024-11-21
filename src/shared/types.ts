export interface IngredientForRecipe {
  id: number;
  user_id: string;
  recipe_id: number;
  ingredient_id: number;
  quantity_in_recipe: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type IngredientRecipe = {
  recipe_id: number;
  ingredient_id: number;
  quantity_in_recipe: number;
  notes: string;
}

export type Ingredient = {
  id: number,
  user_id: string,
  name: string,
  quantity: number,
  unit: string,
  purchase_price: number,
  price_per_unit: number,
  notes: string
}

export type Recipe = {
  id: number,
  user_id: string,
  name: string,
  description: string,
  servings_per_recipe: number,
  //ingredients: { id: number, quantity: number }[],
  calculated_cost: number,
  instructions: string,
  notes: string,
  created_at: Date,
  updated_at: Date
}

export type User = {
  id: string,
  name: string,
  email: string,
  created_at: string,
  password_changed_at: string,
  last_login: string
}

export type AuthToken = {
  token: string,
  expires_at: string
}

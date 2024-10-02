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

export type User = {
  id: number,
  name: string,
  username: string,
  email: string,
  created_at: string,
  updated_at: string,
  last_login: string
}
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
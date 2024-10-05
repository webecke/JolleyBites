import type { AuthToken, User } from './types'

export type LoginRequest = {
  email: string,
  password: string,
}

export type RegisterRequest = {
  name: string,
  email: string,
  password: string,
}

export type LoginRegisterResponse = {
  user: User,
  authToken: AuthToken
}

export type ClientGeneratedIngredient = {
  name: string,
  quantity: number,
  unit: string,
  purchase_price: number,
  notes: string
}
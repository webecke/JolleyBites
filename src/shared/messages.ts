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

export type RecipeMetaUpdate = {
  id: number,
  name: string,
  description: string,
  servings_per_recipe: number,
  instructions: string,
  notes: string,
}

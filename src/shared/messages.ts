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

export type RegisterResponse = {
  user: User,
  authToken: AuthToken
}
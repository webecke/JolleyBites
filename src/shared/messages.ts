import type { User } from './types'

export type LoginRequest = {
  username: string,
  password: string,
}

export type RegisterRequest = {
  user: User,
  password: string,
}
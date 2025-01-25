import type { User } from '../../shared/types'

export interface ServerContext extends
  UserContext {
  // Can add more shared properties here
}

export interface UserContext {
  user: User
}

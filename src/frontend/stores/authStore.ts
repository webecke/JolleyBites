import { readonly, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthToken, User } from '../../shared/types'

export const useAuthStore = defineStore('auth', () => {

  const currentUser = ref<User | null>(null)
  const authToken = ref<AuthToken | null>(null)

  return {
    currentUser,
    authToken
  }
})
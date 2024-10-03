import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthToken, User } from '../../shared/types'
import type { LoginRegisterResponse } from '../../shared/messages'
import { getMe } from '@/services/AuthService'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {

  const currentUser = ref<User | null>(null)
  const authTokenString = ref<string | null>(null)
  const isLoggedIn = computed(() => {
    return (currentUser.value != null);
  })

  const getCurrentUser = async (): Promise<User | null> => {
    if (currentUser.value != null) { return currentUser.value }
    if (getAuthToken() == null) { return null }
    try {
      const user = await getMe();
      currentUser.value = user
      return currentUser.value
    } catch (error) {
      console.error("ERROR fetching user. Assuming logged out. Going to login now")
      clearLocalAuthToken()
      authTokenString.value = null
      router.push("/login")
      return null
    }
  }

  const getAuthToken = (): string | null => {
    if (authTokenString.value != null) { return authTokenString.value }

    const local = getLocalAuthToken()
    if (local == null) {
      currentUser.value = null
      return null
    }

    authTokenString.value = local
    return authTokenString.value
  }

  const login = (response: LoginRegisterResponse) => {
    currentUser.value = response.user
    authTokenString.value = response.authToken.token

    locallySaveAuthToken(response.authToken.token)
    console.log(`saved authtoken: ${response.authToken.token}`)
  }

  return {
    getCurrentUser,
    currentUser,
    getAuthToken,
    isLoggedIn,
    login
  }
})

export const AUTH_TOKEN_KEY = 'jolleybites_auth_token';

export function locallySaveAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getLocalAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearLocalAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '../../shared/types'
import type { LoginRegisterResponse } from '../../shared/messages'
import { getMe } from '@/services/AuthService'
import router from '@/router'
import { useDataStore } from '@/stores/dataStore'

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
      logout()
      router.push("/login")
      return null
    }
  }

  const getNameOfCurrentUser = (): string => {
    return currentUser.value == null ? "WHat" : currentUser.value.name
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

  const login = async (response: LoginRegisterResponse) => {
    currentUser.value = response.user
    authTokenString.value = response.authToken.token

    locallySaveAuthToken(response.authToken.token)
    console.log(`saved authtoken: ${response.authToken.token}`)
  }

  const logout = () => {
    currentUser.value = null
    authTokenString.value = null

    clearLocalAuthToken()
    useDataStore().clearDataStore()
    console.log('logged out, cleared local authtoken, and cleared local dataStore')
  }

  return {
    getCurrentUser,
    currentUser,
    getNameOfCurrentUser,
    getAuthToken,
    isLoggedIn,
    login,
    logout
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
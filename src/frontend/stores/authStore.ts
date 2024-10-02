import { computed, readonly, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthToken, User } from '../../shared/types'
import type { LoginRegisterResponse } from '../../shared/messages'
import { getMe } from '@/services/AuthService'
import { snackbarStore } from '@/stores/snackbarStore'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {

  const currentUser = ref<User | null>(null)
  const authToken = ref<AuthToken | null>(null)
  const nameOfUser = currentUser.value?.name
  const isLoggedIn = computed(() => {
    return (currentUser.value != null);
  })

  const getCurrentUser = async (): Promise<User | null> => {
    if (currentUser.value != null) { return currentUser.value }
    if (getAuthToken() == null) { return null }
    try {
      currentUser.value = await getMe();
      return currentUser.value
    } catch (error) {
      router.push("/login")
      return null
    }
  }

  const getAuthToken = (): AuthToken | null => {
    if (authToken.value != null) { return authToken.value }

    const local = getLocalAuthToken()
    console.log(`fetched local authtoken: ${local}`)
    if (local == null) {
      currentUser.value = null
      return null
    }

    authToken.value = { token: local }
    return authToken.value
  }

  const login = (response: LoginRegisterResponse) => {
    currentUser.value = response.user
    authToken.value = response.authToken

    locallySaveAuthToken(response.authToken.token)
    console.log(`saved authtoken: ${response.authToken.token}`)
  }

  return {
    getCurrentUser,
    getAuthToken,
    isLoggedIn,
    nameOfUser,
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
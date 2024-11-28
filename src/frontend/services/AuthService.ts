import type { LoginRegisterResponse } from '../../shared/messages'
import { ServerCommunicator } from '@/services/ServerCommunicator'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '../../shared/types'
import { snackbarStore } from '@/stores/snackbarStore'
import { useDataStore } from '@/stores/dataStore'

export const doRegister = async (name: string, email: string, password: string) => {
  const response = await ServerCommunicator.postRequest<LoginRegisterResponse>("/auth/register", {
    name: name,
    email: email,
    password: password
  })

  await useAuthStore().login(response)
  await initializeApp()
}

export const doLogin = async (email: string, password: string) => {
  const response: LoginRegisterResponse = await ServerCommunicator.postRequest<LoginRegisterResponse>("/auth/login", {
    email: email,
    password: password
  })

  await useAuthStore().login(response)
  await initializeApp()
}

export const doLogout = async () => {
  await ServerCommunicator.deleteRequest("/auth/logout")

  useAuthStore().logout()

  snackbarStore.showMessage("Successfully logged out", {color:"yellow"})
}

export const getMe = async () => {
  return await ServerCommunicator.getRequest<User>("/auth/me")
}

export const initializeApp = async () => {
  await useAuthStore().getAuthToken()
  await useAuthStore().getCurrentUser()
  if (useAuthStore().isLoggedIn) {
    await useDataStore().initializeDataStore()
  }
}

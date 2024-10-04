import type { LoginRegisterResponse } from '../../shared/messages'
import { ServerCommunicator } from '@/services/ServerCommunicator'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '../../shared/types'
import { snackbarStore } from '@/stores/snackbarStore'

export const doRegister = async (name: string, email: string, password: string) => {
  const response = await ServerCommunicator.postRequest<LoginRegisterResponse>("/auth/register", {
    name: name,
    email: email,
    password: password
  })

  useAuthStore().login(response)
}

export const doLogin = async (email: string, password: string) => {
  const response: LoginRegisterResponse = await ServerCommunicator.postRequest<LoginRegisterResponse>("/auth/login", {
    email: email,
    password: password
  })

  useAuthStore().login(response)
}

export const doLogout = async () => {
  await ServerCommunicator.deleteRequest<{message: string}>("/auth/logout")

  useAuthStore().logout()

  snackbarStore.showMessage("Successfully logged out", {color:"yellow"})
}

export const getMe = async () => {
  return await ServerCommunicator.getRequest<User>("/auth/me")
}
import type { LoginRegisterResponse } from '../../shared/messages'
import { ServerCommunicator } from '@/services/ServerCommunicator'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '../../shared/types'

export const doRegister = async (name: string, email: string, password: string) => {
  const response = await ServerCommunicator.postRequest<LoginRegisterResponse>("/auth/register", {
    name: name,
    email: email,
    password: password
  })

  useAuthStore().login(response)
}

export const getMe = async () => {
  return await ServerCommunicator.getRequest<User>("/auth/me")
}
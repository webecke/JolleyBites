import type { RegisterResponse } from '../../shared/messages'
import { ServerCommunicator } from '@/services/ServerCommunicator'
import { useAuthStore } from '@/stores/authStore'

export const doRegister = async (name: string, email: string, password: string) => {
  const {user, authToken} = await ServerCommunicator.postRequest<RegisterResponse>("/auth/register", {
    name: name,
    email: email,
    password: password
  })

  const authStore = useAuthStore()

  authStore.authToken = authToken
  authStore.currentUser = user
}
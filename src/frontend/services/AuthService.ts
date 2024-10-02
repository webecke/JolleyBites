import type { RegisterResponse } from '../../shared/messages'
import { ServerCommunicator } from '@/services/ServerCommunicator'

export const doRegister = async (name: string, email: string, password: string): Promise<RegisterResponse> => {
  return await ServerCommunicator.postRequest<RegisterResponse>("/auth/register", {
    name: name,
    email: email,
    password: password
  })
}
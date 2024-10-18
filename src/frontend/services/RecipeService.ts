import { ServerCommunicator } from '@/services/ServerCommunicator'

export const newRecipePost = async (name: string) => {
  return await ServerCommunicator.postRequest<{recipeId: number}>("/api/recipes", {name: name})
}
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Ingredient } from '../../shared/types'
import { getAllIngredients } from '@/services/IngredientService'

export const useDataStore = defineStore('data', () => {
  const initializeDataStore = async ()  => {
    if (dataIsLoaded.value) { return }

    try {
      ingredients.value = await getAllIngredients()
    } catch(e) {
      console.log("Error initializing local DataStore: " + e)
    }
    dataIsLoaded.value = true
  }

  const dataIsLoaded = ref<boolean>(false)

  const ingredients = ref<Ingredient[]>([])

  const addIngredient = (newIngredient: Ingredient) => {
    ingredients.value = [...ingredients.value, newIngredient];
  };

  const deleteIngredients = (ids: number[]) => {
    ingredients.value = ingredients.value.filter(ingredient => !ids.includes(ingredient.id));
  }

  return {
    ingredients,
    dataIsLoaded,
    initializeDataStore,
    addIngredient,
    deleteIngredients
  }
})
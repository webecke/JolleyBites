import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Ingredient } from '../../shared/types'
import { getAllIngredients } from '@/services/IngredientService'

export const useDataStore = defineStore('data', () => {
  const initializeDataStore = async ()  => {
    if (dataIsLoaded.value) { return }

    try {
      await loadIngredients()
    } catch(e) {
      console.log("Error initializing local DataStore: " + e)
      return
    }
    dataIsLoaded.value = true
  }

  const dataIsLoaded = ref<boolean>(false)

  const state = reactive({
    ingredients: [] as Ingredient[]
  })

  const ingredients = computed(() => state.ingredients)

  const loadIngredients = async () => {
    const response: Ingredient[] = await getAllIngredients()
    state.ingredients.length = 0
    state.ingredients.push(...response)
  }

  const addIngredient = (newIngredient: Ingredient) => {
    state.ingredients.push(newIngredient);
  };

  const deleteIngredients = (ids: number[]) => {
    state.ingredients = state.ingredients.filter(ingredient => !ids.includes(ingredient.id));
  }

  return {
    ingredients: ingredients,
    dataIsLoaded,
    loadIngredients,
    initializeDataStore,
    addIngredient,
    deleteIngredients
  }
})
import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Ingredient, Recipe } from '../../shared/types'
import { getAllIngredients } from '@/services/IngredientService'
import { getAllRecipes } from '@/services/RecipeService'

export const useDataStore = defineStore('data', () => {
  const initializeDataStore = async ()  => {
    if (dataIsLoaded.value) { return }

    try {
      await loadIngredients()
      await loadRecipes()
    } catch(e) {
      console.log("Error initializing local DataStore: " + e)
      return
    }
    dataIsLoaded.value = true
  }

  const dataIsLoaded = ref<boolean>(false)

  const state = reactive({
    ingredients: [] as Ingredient[],
    recipes: [] as Recipe[]
  })

  const ingredients = computed(() => state.ingredients)
  const recipes = computed(() => state.recipes)

  const loadIngredients = async () => {
    const response: Ingredient[] = await getAllIngredients()
    state.ingredients.length = 0
    state.ingredients.push(...response)
  }

  const loadRecipes = async () => {
    const response: Recipe[] = await getAllRecipes()
    state.recipes.length = 0
    state.recipes.push(...response)
  }

  const addIngredient = (newIngredient: Ingredient) => {
    state.ingredients.push(newIngredient);
  };

  const addRecipe = (newRecipe: Recipe) => {
    state.recipes.push(newRecipe)
  }

  const getRecipe = (id: number): Recipe | null => {
    let foundRecipe: Recipe| null = null;

    try {
      state.recipes.forEach(recipe => {
        if (recipe.id == id) {
          foundRecipe = recipe
          throw {}
        }
      })
    } catch (e) {
      return foundRecipe
    }
    return null
  }

  const deleteIngredients = (ids: number[]) => {
    state.ingredients = state.ingredients.filter(ingredient => !ids.includes(ingredient.id));
  }

  const deleteRecipe = (id: number) => {
    state.recipes = state.recipes.filter(recipe => recipe.id != id)
  }

  return {
    ingredients: ingredients,
    recipes: recipes,
    dataIsLoaded,
    loadIngredients,
    loadRecipes,
    initializeDataStore,
    addIngredient,
    addRecipe,
    getRecipe,
    deleteIngredients,
    deleteRecipe
  }
})
import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Ingredient, Recipe, IngredientRecipe } from '../../shared/types'
import { getAllIngredients } from '@/services/IngredientService'
import { getAllRecipes, getIngredientRecipes } from '@/services/RecipeService'

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

  const clearDataStore = () => {
    state.ingredients.length = 0
    state.recipes.length = 0
  }
  const dataIsLoaded = ref<boolean>(false)

  const state = reactive({
    ingredients: [] as Ingredient[],
    recipes: [] as Recipe[],
    ingredientRecipes: new Map<number, IngredientRecipe[]>()
  })

  const ingredients = computed(() => state.ingredients)
  const recipes = computed(() => state.recipes)
  const ingredientRecipes = computed(() => state.ingredientRecipes)

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

  const loadIngredientRecipes = async (recipeId: number, cache: boolean = true) => {
    if (cache && state.ingredientRecipes.has(recipeId)) {
      return;
    }

    const response: IngredientRecipe[] = await getIngredientRecipes(recipeId)
    state.ingredientRecipes.set(recipeId, response);
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

  const updateRecipe = (updatedRecipe: Recipe) => {
    const index = state.recipes.findIndex(recipe  => recipe.id === updatedRecipe.id);
    state.recipes[index] = updatedRecipe
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
    ingredientRecipes: ingredientRecipes,
    dataIsLoaded,
    loadIngredients,
    loadRecipes,
    loadIngredientRecipes,
    initializeDataStore,
    addIngredient,
    addRecipe,
    getRecipe,
    updateRecipe,
    deleteIngredients,
    deleteRecipe,
    clearDataStore
  }
})

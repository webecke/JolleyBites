import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Ingredient, Recipe, RecipeIngredient } from '../../shared/types'
import { getAllIngredients } from '@/services/IngredientService'
import { getAllRecipes, getRecipeIngredients } from '@/services/RecipeService'

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
    state.ingredients = new Map<number, Ingredient>()
    state.recipes = new Map<number, Recipe>()
    state.recipeIngredients = new Map<number, RecipeIngredient[]>()
  }
  const dataIsLoaded = ref<boolean>(false)

  const state = reactive({
    ingredients: new Map<number, Ingredient>(),
    recipes: new Map<number, Recipe>(),
    recipeIngredients: new Map<number, RecipeIngredient[]>()
  })

  const ingredients = computed(() => state.ingredients)
  const recipes = computed(() => state.recipes)
  const recipeIngredients = computed(() => state.recipeIngredients)

  const loadIngredients = async () => {
    const response: Ingredient[] = await getAllIngredients()

    response.forEach((ingredient: Ingredient) => {
      state.ingredients.set(ingredient.id, ingredient)
    })
  }

  const loadRecipes = async () => {
    const response: Recipe[] = await getAllRecipes()

    response.forEach((recipe: Recipe) => {
      state.recipes.set(recipe.id, recipe)
    })
  }

  const loadRecipeIngredients = async (recipeId: number, cache: boolean = true) => {
    if (cache && state.recipeIngredients.has(recipeId)) {
      return;
    }

    const response: RecipeIngredient[] = await getRecipeIngredients(recipeId)
    state.recipeIngredients.set(recipeId, response);
  }

  const addIngredient = (newIngredient: Ingredient) => {
    state.ingredients.set(newIngredient.id, newIngredient);
  };

  const getIngredient = (id: number): Ingredient | undefined => {
    return state.ingredients.get(id)
  }

  const addRecipe = (newRecipe: Recipe) => {
    state.recipes.set(newRecipe.id, newRecipe)
  }

  const getRecipe = (id: number): Recipe | undefined => {
    return state.recipes.get(id)
  }

  const updateRecipe = (updatedRecipe: Recipe) => {
    state.recipes.set(updatedRecipe.id, updatedRecipe)
  }

  const deleteIngredients = (ids: number[]) => {
    ids.forEach(id => state.ingredients.delete(id));
  }

  const deleteRecipe = (id: number) => {
    state.recipes.delete(id)
  }

  return {
    ingredients: ingredients,
    recipes: recipes,
    recipeIngredients: recipeIngredients,
    dataIsLoaded,
    loadIngredients,
    loadRecipes,
    loadRecipeIngredients: loadRecipeIngredients,
    initializeDataStore,
    addIngredient,
    addRecipe,
    getRecipe,
    getIngredient,
    updateRecipe,
    deleteIngredients,
    deleteRecipe,
    clearDataStore
  }
})

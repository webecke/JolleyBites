import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Ingredient, Recipe, RecipeIngredient } from '../../shared/types'
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
    state.ingredients = new Map<number, Ingredient>()
    state.recipes = new Map<number, Recipe>()
    state.ingredientRecipes = new Map<number, RecipeIngredient[]>()
  }
  const dataIsLoaded = ref<boolean>(false)

  const state = reactive({
    ingredients: new Map<number, Ingredient>(),
    recipes: new Map<number, Recipe>(),
    ingredientRecipes: new Map<number, RecipeIngredient[]>()
  })

  const ingredients = computed(() => state.ingredients)
  const recipes = computed(() => state.recipes)
  const ingredientRecipes = computed(() => state.ingredientRecipes)

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

  const loadIngredientRecipes = async (recipeId: number, cache: boolean = true) => {
    if (cache && state.ingredientRecipes.has(recipeId)) {
      return;
    }

    const response: RecipeIngredient[] = await getIngredientRecipes(recipeId)
    state.ingredientRecipes.set(recipeId, response);
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
    ingredientRecipes: ingredientRecipes,
    dataIsLoaded,
    loadIngredients,
    loadRecipes,
    loadIngredientRecipes,
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

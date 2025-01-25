<script setup lang="ts">

import { addNewRecipe } from '@/services/RecipeService'
import { computed, ref } from 'vue'
import { snackbarStore } from '@/stores/snackbarStore'
import router from '@/router'
import { useDataStore } from '@/stores/dataStore'
import type { Recipe } from '../../shared/types'
import { doErrorHandling } from '@/utils/generalUtils'
import { roundToTwoDecimals } from '../utils/formatUtils'

const newRecipeName = ref<string>("")
const showNewRecipeMenu = ref<boolean>(false)
const searchKey = ref<string>("")

const visibleRecipes = computed(() => {
  const lowercaseSearchKey = searchKey.value.trim().toLowerCase()
  return Array.from(useDataStore().recipes.values()).filter(recipe =>
    recipe.name.toLowerCase().includes(lowercaseSearchKey) ||
    recipe.description.toLowerCase().includes(lowercaseSearchKey)
  ) as Recipe[]
})

const openNewRecipeMenu = () => {
  newRecipeName.value = ""
  showNewRecipeMenu.value = true
}

const submitNewRecipe = async () => {
  if (newRecipeName.value.trim() == '') {
    snackbarStore.showWarningMessage("Please enter a name for your recipe")
    return
  }

  await doErrorHandling(async () => {
    let recipeId;
    recipeId = await addNewRecipe(newRecipeName.value)
    snackbarStore.showSuccessMessage("Recipe created!")
    await router.push("/recipes/" + recipeId)
  }, "creating new recipe")
}
</script>

<template>
  <h1>My Recipes</h1>
  <p>Here are all of your recipes. Click on one to view more detail or to edit.</p>

  <v-btn @click="openNewRecipeMenu">Create New Recipe</v-btn>

  <div class="recipe-list">
    <div class="recipe"
         v-for="recipe in visibleRecipes"
         :key="recipe.id"
         @click="router.push('/recipes/' + recipe.id)">

      <div class="recipe-info">
        <h3 class="recipe-name">{{recipe.name}}</h3>
        <p class="recipe-description">{{recipe.description}}</p>
      </div>

      <div class="recipe-pricing">
        <p class="recipe-total-price">${{roundToTwoDecimals(recipe.calculated_cost)}}</p>
        <p class="recipe-serving-price">
          (${{roundToTwoDecimals(recipe.calculated_cost / recipe.servings_per_recipe)}}/serving)
        </p>
      </div>
    </div>
  </div>


  <v-dialog
    v-model="showNewRecipeMenu"
    width="auto"
    min-width="300px"
  >
    <v-card title="Create New Recipe">
      <template v-slot:text>
        <p>First, lets name your recipe</p>
        <v-text-field v-model="newRecipeName" label="Recipe Name"/>
        <p><em>You will be able to change this later</em></p>
      </template>
      <template v-slot:actions>
        <v-btn @click="submitNewRecipe" color="green">Create</v-btn>
        <v-btn @click="showNewRecipeMenu = false">Cancel</v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.recipe {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  cursor: pointer;
  width: 100%;
  background-color: var(--vt-c-divider-dark-2);
  margin: 10px;
  border-radius: 10px;
}

.recipe:hover {
  background-color: #4e4e4e;
}

.recipe-info {
  flex: 1;
  min-width: 0; /* Allows text truncation to work */
}

.recipe-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.recipe-description {
  color: #cdcccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recipe-pricing {
  text-align: right;
  margin-left: 1rem;
}

.recipe-total-price {
  font-weight: 600;
}

.recipe-serving-price {
  font-size: 0.875rem;
  color: #cdcccc;
}
</style>

<script setup lang="ts">

import { addNewRecipe } from '@/services/RecipeService'
import { computed, ref } from 'vue'
import { snackbarStore } from '@/stores/snackbarStore'
import router from '@/router'
import { useDataStore } from '@/stores/dataStore'
import type { Recipe } from '../../shared/types'
import { doErrorHandling } from '@/utils/generalUtils'

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

  <div>
    <div v-for="recipe in visibleRecipes" :key="recipe.id"
         @click="router.push('/recipes/' + recipe.id)"
         style="display: flex">

      <p>{{recipe.name}}</p>
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

</style>

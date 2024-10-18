<script setup lang="ts">

import { newRecipePost } from '@/services/RecipeService'
import { ref } from 'vue'
import { snackbarStore } from '@/stores/snackbarStore'
import router from '@/router'

const newRecipeName = ref<string>("")
const showNewRecipeMenu = ref<boolean>(false)
const openNewRecipeMenu = () => {
  newRecipeName.value = ""
  showNewRecipeMenu.value = true
}

const submitNewRecipe = async () => {
  let recipeId;
  try {
    recipeId = await newRecipePost(newRecipeName.value)
  } catch (error) {
    if (error instanceof Error) {
      snackbarStore.showMessage(error.message, {color: "warning", timeout: 10000})
    } else {
      snackbarStore.showMessage("Something went wrong, recipe wasn't created", {color: "error", timeout: -1})
    }
    return
  }
  snackbarStore.showMessage("Recipe created!", {color: "green"})
  await router.push("/recipes/" + recipeId.recipeId)
}
</script>

<template>
  <h1>My Recipes</h1>
  <p>Here are all of your recipes. Click on one to view more detail or to edit.</p>

  <v-btn @click="openNewRecipeMenu">Create New Recipe</v-btn>





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
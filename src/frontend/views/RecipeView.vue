<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onBeforeMount, onMounted, ref } from 'vue'
import type { Recipe } from '../../shared/types'
import { convertNewlinesToBr, formatDate, roundToTwoDecimals } from '@/utils/formatUtils'

let testRecipe: Recipe = {
  id: 37,
  user_id: "TEST_MCGEE",
  name: "Youngberg Meatloaf",
  description: "An amazing meatloaf that is both amazing and meatloaf",
  servings_per_recipe: 6,
  ingredients: [
    {id: 17, quantity: 13},
    {id: 18, quantity: 3},
    {id: 19, quantity: 66},
    {id: 10, quantity: 32},
  ],
  calculated_cost: 35.12,
  instructions: "Set on fire. \n Eat blue cheese",
  notes: "Good for the homies\n bad for joe biden",
  created_at: new Date(),
  updated_at: new Date()
}

const route = useRoute()

const id = ref(route.params.id as string)
const recipe = ref<Recipe>({} as Recipe)
const showEditMode = ref<boolean>(false)

onMounted(() => {
  loadRecipe()
})

const loadRecipe = () => {
  recipe.value = testRecipe
  if (!recipe.value) {
    console.log("Error loading recipe")
  }
}
</script>

<template>
  <div id="recipeTopArea">
    <div>
      <h1>Recipe: {{recipe.name}}</h1>
      <p>{{recipe.description}}</p>
      <p><em>This recipe makes {{recipe.servings_per_recipe}} servings</em></p>
    </div>
    <v-btn v-if="showEditMode" color="green">
      Save <font-awesome-icon :icon="['fas', 'file-arrow-up']" />
    </v-btn>
    <v-btn v-else @click="showEditMode = true">
      Edit<font-awesome-icon :icon="['fas', 'pen-to-square']" />
    </v-btn>
  </div>

  <hr style="width: 100%;"/>

  <div>
    <h3>Recipe Cost: <b>${{roundToTwoDecimals(recipe.calculated_cost)}}</b></h3>
    <h3>Cost Per Serving: <b>${{roundToTwoDecimals(recipe.calculated_cost / recipe.servings_per_recipe)}}</b></h3>
  </div>

  <div class="flexableColumnContainer">
    <div class="flexableColumns" style="flex: 60%">

    </div>
    <div class="flexableColumns" style="flex: 40%">
      <h3>Instructions:</h3>
      <p v-if="recipe.instructions == ''"><em>No instructions</em></p>
      <p v-else v-html="convertNewlinesToBr(recipe.instructions)"/>

      <hr style="width: 100%;"/>

      <h3>Notes:</h3>
      <p v-if="recipe.notes == ''"><em>No notes</em></p>
      <p v-else v-html="convertNewlinesToBr(recipe.notes)"/>

      <hr style="width: 100%;"/>

      <p>Created {{formatDate(recipe.created_at)}}</p>
      <p>Last edited {{formatDate(recipe.updated_at)}}</p>
    </div>
  </div>
</template>

<style scoped>
#recipeTopArea {
  display: flex;
  justify-content: space-between;
}

.flexableColumnContainer {
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
}

@media screen and (max-width: 600px) {
  .flexableColumns {
    flex: 100%;
  }
}
</style>
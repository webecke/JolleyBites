<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import type { Recipe } from '../../shared/types'
import { convertNewlinesToBr, formatDate, roundToTwoDecimals, trimObjectStrings } from '@/utils/formatUtils'
import { useDataStore } from '@/stores/dataStore'
import router from '@/router'

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

onMounted(async () => {
  await loadRecipe()
})

const loadRecipe = async () => {
  const foundRecipe = useDataStore().getRecipe(Number(id.value))

  if (foundRecipe == null) { await router.push("/404"); return }
  recipe.value = foundRecipe
  console.log(recipe.value)
}

const saveRecipe = () => {
  recipe.value = trimObjectStrings<Recipe>(recipe.value)
  showEditMode.value = false
}
</script>

<template>
  <div id="recipeTopArea">
    <div style="width: 100%;">
      <h1 style="display: flex">
        <v-text-field v-if="showEditMode" v-model="recipe.name" label="Name"/>
        <span v-else>{{recipe.name}}</span>
      </h1>

      <v-text-field v-if="showEditMode" v-model="recipe.description" label="Description"/>
      <p v-else-if="recipe.description == ''"><em>No description</em></p>
      <p v-else>{{recipe.description}}</p>

      <p v-if="showEditMode">
        Servings per recipe:
        <v-text-field style="width: 100px" type="number" v-model="recipe.servings_per_recipe"/>
      </p>
      <p v-else><em>This recipe makes {{recipe.servings_per_recipe}} servings</em></p>
    </div>
    <v-btn v-if="showEditMode" color="green" @click="saveRecipe">
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
    <div class="flexableColumns" style="width: 60%">
      This is the ingredients area
    </div>
    <div class="flexableColumns" style="width: 40%">
      <v-textarea
        v-if="showEditMode"
        v-model="recipe.instructions"
        label="Instructions"
        placeholder="How to actually make this"
        :rows="3"
        auto-grow
        outlined
      />
      <div v-else>
        <h3>Instructions:</h3>
        <p v-if="recipe.instructions == ''"><em>No instructions</em></p>
        <p v-else v-html="convertNewlinesToBr(recipe.instructions)"/>
      </div>

      <v-textarea
        v-if="showEditMode"
        v-model="recipe.notes"
        label="Notes"
        placeholder="Things to remember about this recipe"
        :rows="2"
        auto-grow
        outlined
      />
      <div v-else>
        <hr style="width: 100%;"/>
        <h3>Notes:</h3>
        <p v-if="recipe.notes == ''"><em>No notes</em></p>
        <p v-else v-html="convertNewlinesToBr(recipe.notes)"/>
      </div>

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
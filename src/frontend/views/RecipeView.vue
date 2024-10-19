<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import type { Recipe } from '../../shared/types'
import { convertNewlinesToBr, formatDate, roundToTwoDecimals, trimObjectStrings } from '@/utils/formatUtils'
import { useDataStore } from '@/stores/dataStore'
import router from '@/router'
import { deleteRecipe } from '@/services/RecipeService'
import { snackbarStore } from '@/stores/snackbarStore'
import { doErrorHandling } from '@/utils/generalUtils'

const route = useRoute()

const id = ref(route.params.id as string)
const recipe = ref<Recipe>({} as Recipe)
const showEditMode = ref<boolean>(false)
const showDeleteConfirmation = ref<boolean>(false)

onMounted(async () => {
  await loadRecipe()
})

const loadRecipe = async () => {
  const foundRecipe = useDataStore().getRecipe(Number(id.value))

  if (foundRecipe == null) {
    await router.push("/recipes");
    snackbarStore.showWarningMessage("Not Found: That recipe either doesn't belong to you, or no longer exists")
    return
  }
  recipe.value = foundRecipe
  console.log(recipe.value)
}

const saveRecipe = () => {
  recipe.value = trimObjectStrings<Recipe>(recipe.value)
  showEditMode.value = false
}

const doDeleteRecipe = async () => {
  await doErrorHandling(async () => {
    await deleteRecipe(recipe.value.id)
    snackbarStore.showSuccessMessage("Recipe deleted")
    await router.push("/recipes")
  }, "deleting recipe")
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
      <v-btn v-if="showEditMode" color="red" @click="showDeleteConfirmation = true">Delete Recipe</v-btn>
    </div>
  </div>


  <v-dialog
    v-model="showDeleteConfirmation"
    width="auto"
    min-width="300px">
    <v-card title="Are you sure?">
      <template v-slot:text>
        <p>Do you want to delete your {{recipe.name}} recipe?</p>
        <p><em>You can not undo this</em></p>
      </template>
      <template v-slot:actions>
        <v-btn @click="doDeleteRecipe" color="red">Delete</v-btn>
        <v-btn @click="showDeleteConfirmation = false">Cancel</v-btn>
      </template>
    </v-card>
  </v-dialog>
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
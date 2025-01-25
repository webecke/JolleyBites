<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, reactive, ref } from 'vue'
import type { Recipe, RecipeIngredient } from '../../shared/types'
import { trimObjectStrings } from '@/utils/formatUtils'
import { useDataStore } from '@/stores/dataStore'
import router from '@/router'
import { updateRecipe } from '@/services/RecipeService'
import { snackbarStore } from '@/stores/snackbarStore'
import { doErrorHandling } from '@/utils/generalUtils'
import RecipeDetails from '@/components/recipes/RecipeDetails.vue'
import RecipeInfo from '@/components/recipes/RecipeInfo.vue'
import RecipeIngredientsList from '@/components/recipes/RecipeIngredientsList.vue'

const route = useRoute()

const data = useDataStore()
const id = ref(route.params.id as string)
const recipe = reactive<Recipe>({} as Recipe)
const ingredientList = ref<RecipeIngredient[]>([])
const preEditedRecipe = ref<Recipe>({} as Recipe)
const showEditMode = ref<boolean>(false)
const initialEdit = computed(() => recipe.created_at == recipe.updated_at)

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

  Object.assign(recipe, foundRecipe)

  await data.loadRecipeIngredients(recipe.id)
  const recipeIngredients = data.recipeIngredients.get(recipe.id) || []
  ingredientList.value = [...recipeIngredients]

  console.log(recipeIngredients)

  if (initialEdit.value) {
    showEditMode.value = true
  }
}

const saveRecipe = async () => {
  Object.assign(recipe, trimObjectStrings<Recipe>(recipe))

  if (recipe.servings_per_recipe <= 0) {
    snackbarStore.showWarningMessage("Please enter a value greater than 0 for 'servings per recipe'")
    return
  } else if (recipe.name == "") {
    snackbarStore.showWarningMessage("Please enter a recipe name")
    return
  }

  await doErrorHandling(async () => {
    await updateRecipe(recipe, ingredientList.value)
    const updatedRecipe = useDataStore().getRecipe(recipe.id)
    if (updatedRecipe == undefined) {
      snackbarStore.showCriticalErrorMessage("Something went wrong saving the recipe, please reload the page")
      return
    }
    Object.assign(recipe, updatedRecipe)
    showEditMode.value = false
  }, "saving changes to recipe")
}

const startEdit = () => {
  preEditedRecipe.value = { ...recipe }
  showEditMode.value = true
}

const cancelEdit = () => {
  Object.assign(recipe, { ...preEditedRecipe.value })
  showEditMode.value = false
}
</script>

<template>
  <RecipeInfo
    :showEditMode="showEditMode"
    :calculated_cost="recipe.calculated_cost"
    v-model:name="recipe.name"
    v-model:description="recipe.description"
    v-model:servings_per_recipe="recipe.servings_per_recipe"
    @saveRecipe="saveRecipe"
    @cancelEdit="cancelEdit"
    @startEdit="startEdit"
  />

  <div class="flexableColumnContainer">
    <div class="flexableColumns" style="width: 60%; padding-right: 20px;">
      <RecipeIngredientsList
        :showEditMode="showEditMode"
        v-model:ingredientRecipes="ingredientList"
        :recipeId="recipe.id"/>
    </div>

    <div class="flexableColumns" style="width: 40%">
      <RecipeDetails
        :recipeId="recipe.id"
        v-model:instructions="recipe.instructions"
        v-model:notes="recipe.notes"
        :created_at="recipe.created_at"
        :updated_at="recipe.updated_at"
        :showEditMode="showEditMode"/>
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

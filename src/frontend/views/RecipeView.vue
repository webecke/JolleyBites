<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, reactive, ref } from 'vue'
import type { Recipe, IngredientRecipe } from '../../shared/types'
import { roundToTwoDecimals, trimObjectStrings } from '@/utils/formatUtils'
import { useDataStore } from '@/stores/dataStore'
import router from '@/router'
import { deleteRecipe, updateRecipe } from '@/services/RecipeService'
import { snackbarStore } from '@/stores/snackbarStore'
import { doErrorHandling } from '@/utils/generalUtils'
import RecipeDetails from '@/components/recipes/RecipeDetails.vue'
import RecipeInfo from '@/components/recipes/RecipeInfo.vue'
import RecipeIngredientsList from '@/components/recipes/RecipeIngredientsList.vue'

const route = useRoute()

const data = useDataStore()
const id = ref(route.params.id as string)
const recipe = reactive<Recipe>({} as Recipe)
const ingredientList = ref<IngredientRecipe[]>([])
const preEditedRecipe = ref<Recipe>({} as Recipe)
const showEditMode = ref<boolean>(false)
const showDeleteConfirmation = ref<boolean>(false)
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

  await data.loadIngredientRecipes(recipe.id)
  const recipeIngredients = data.ingredientRecipes.get(recipe.id) || []
  ingredientList.value = [...recipeIngredients]

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
    await updateRecipe(recipe)
    const updatedRecipe = useDataStore().getRecipe(recipe.id)
    if (updatedRecipe == null) {
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
  if (initialEdit.value) {
    showDeleteConfirmation.value = true
    return
  }

  Object.assign(recipe, { ...preEditedRecipe.value })
  showEditMode.value = false
}

const doDeleteRecipe = async () => {
  await doErrorHandling(async () => {
    await deleteRecipe(recipe.id)
    snackbarStore.showSuccessMessage("Recipe deleted")
    await router.push("/recipes")
  }, "deleting recipe")
}

const ingredientsWithDetails = computed(() =>
  ingredientList.value.map(ingredient => ({
    ...ingredient,
    details: data.getIngredient(ingredient.ingredient_id)
  }))
)
</script>

<template>
  <RecipeInfo
    :calculated_cost="recipe.calculated_cost"
    :name="recipe.name"
    :description="recipe.description"
    :servings_per_recipe="recipe.servings_per_recipe"/>

  <div class="flexableColumnContainer">
    <div class="flexableColumns" style="width: 60%">
<!--      <div v-for="ingredient in ingredientsWithDetails" :key="ingredient.ingredient_id">-->
<!--        <div v-if="!ingredient.details">-->
<!--          <p>Error loading ingredient {{ingredient.ingredient_id}}</p>-->
<!--        </div>-->
<!--        <div v-else-if="showEditMode">-->
<!--          <v-text-field label="Quantity"/>-->
<!--          {{ingredient.details.unit}} of {{ingredient.details.name}}-->
<!--        </div>-->
<!--        <div v-else>-->
<!--          {{ingredient.quantity_in_recipe}} {{ingredient.details.unit}} of {{ingredient.details.name}}-->
<!--        </div>-->
<!--      </div>-->
      <RecipeIngredientsList
        :ingredientRecipes="ingredientList"
        :recipeId="recipe.id"/>
    </div>

    <div class="flexableColumns" style="width: 40%">
      <RecipeDetails
        :recipeId="recipe.id"
        :instructions="recipe.instructions"
        :notes="recipe.notes"
        :created_at="recipe.created_at"
        :updated_at="recipe.updated_at"
        :showEditMode="showEditMode"/>
    </div>
  </div>


  <v-dialog
    v-model="showDeleteConfirmation"
    width="auto"
    min-width="300px">
    <v-card v-if="initialEdit" title="Are you sure?">
      <template v-slot:text>
        <p>Do you want to cancel creating this recipe?</p>
        <p><em>You can not undo this</em></p>
      </template>
      <template v-slot:actions>
        <v-btn @click="doDeleteRecipe" color="red">Cancel creating recipe</v-btn>
        <v-btn @click="showDeleteConfirmation = false">Continue making recipe</v-btn>
      </template>
    </v-card>
    <v-card v-else title="Are you sure?">
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

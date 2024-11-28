<script setup lang="ts">
import { convertNewlinesToBr, formatDate } from '@/utils/formatUtils'
import { ref } from 'vue'
import { doErrorHandling } from '@/utils/generalUtils'
import { deleteRecipe } from '@/services/RecipeService'
import { snackbarStore } from '@/stores/snackbarStore'
import router from '@/router'

const { recipeId } = defineProps<{
  recipeId: number;
  instructions: string;
  notes: string;
  created_at: Date;
  updated_at: Date;
  showEditMode: boolean;
}>();

const showDeleteConfirmation = ref<boolean>(false)

const doDeleteRecipe = async () => {
  await doErrorHandling(async () => {
    await deleteRecipe(recipeId)
    snackbarStore.showSuccessMessage("Recipe deleted")
    await router.push("/recipes")
  }, "deleting recipe")
}
</script>

<template>
  <div>
    <h3>Instructions:</h3>
    <p v-if="instructions == ''"><em>No instructions</em></p>
    <p v-else v-html="convertNewlinesToBr(instructions)"/>
  </div>

  <div>
    <hr style="width: 100%;"/>
    <h3>Notes:</h3>
    <p v-if="notes == ''"><em>No notes</em></p>
    <p v-else v-html="convertNewlinesToBr(notes)"/>
  </div>

  <hr style="width: 100%;"/>

  <p>Created {{formatDate(created_at)}}</p>
  <p>Last edited {{formatDate(updated_at)}}</p>
  <v-btn v-if="showEditMode || true" color="red" @click="showDeleteConfirmation = true">Delete Recipe</v-btn>


  <v-dialog
    v-model="showDeleteConfirmation"
    width="auto"
    min-width="300px">
    <v-card title="Are you sure?">
      <template v-slot:text>
        <p>Do you want to delete this recipe?</p>
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

</style>

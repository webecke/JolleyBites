<script setup lang="ts">
import { convertNewlinesToBr, formatDate } from '@/utils/formatUtils'

defineProps<{
  recipeId: number;
  instructions: string;
  notes: string;
  created_at: Date;
  updated_at: Date;
  showEditMode: boolean;
}>();

</script>

<template>
<!--  <v-textarea-->
<!--    v-if="showEditMode"-->
<!--    v-model="recipe.instructions"-->
<!--    label="Instructions"-->
<!--    placeholder="How to actually make this"-->
<!--    :rows="3"-->
<!--    auto-grow-->
<!--    outlined-->
<!--  />-->
  <div>
    <h3>Instructions:</h3>
    <p v-if="instructions == ''"><em>No instructions</em></p>
    <p v-else v-html="convertNewlinesToBr(instructions)"/>
  </div>

<!--  <v-textarea-->
<!--    v-if="showEditMode"-->
<!--    v-model="recipe.notes"-->
<!--    label="Notes"-->
<!--    placeholder="Things to remember about this recipe"-->
<!--    :rows="2"-->
<!--    auto-grow-->
<!--    outlined-->
<!--  />-->
  <div>
    <hr style="width: 100%;"/>
    <h3>Notes:</h3>
    <p v-if="notes == ''"><em>No notes</em></p>
    <p v-else v-html="convertNewlinesToBr(notes)"/>
  </div>

  <hr style="width: 100%;"/>

  <p>Created {{formatDate(created_at)}}</p>
  <p>Last edited {{formatDate(updated_at)}}</p>
<!--  <v-btn v-if="showEditMode" color="red" @click="true">Delete Recipe</v-btn>-->
</template>

<style scoped>

</style>

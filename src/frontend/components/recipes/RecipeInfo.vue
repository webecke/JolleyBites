<script setup lang="ts">

import { roundToTwoDecimals } from '@/utils/formatUtils'

defineProps<{
  showEditMode: boolean,
  name: string,
  description: string,
  servings_per_recipe: number,
  calculated_cost: number
}>()

const emit = defineEmits(['saveRecipe', 'cancelEdit', 'startEdit',
  'update:name', 'update:description', 'update:servings_per_recipe'])

</script>

<template>
  <div id="recipeTopArea">
    <div style="width: 100%;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <v-text-field
            v-if="showEditMode"
            :value="name"
            @input="emit('update:name', $event.target.value)"
            placeholder="Add recipe name..."
            style="min-width: 60vw"
            density="compact"
            hide-details
          />
          <h1 v-else>{{name}}</h1>
        </div>
        <h1>
          <font-awesome-icon :icon="['fas', 'pen-to-square']"
                             v-if="!showEditMode"
                             style="cursor: pointer;"
                             @click="emit('startEdit')"/>
          <font-awesome-icon :icon="['fas', 'rotate-left']"
                             v-if="showEditMode"
                             style="cursor: pointer; color: white; margin-right: 10px"
                             @click="emit('cancelEdit')"/>
          <font-awesome-icon :icon="['fas', 'floppy-disk']"
                             v-if="showEditMode"
                             style="cursor: pointer; color: green"
                             @click="emit('saveRecipe')"/>
        </h1>
      </div>

      <v-text-field
        v-if="showEditMode"
        :value="description"
        @input="emit('update:description', $event.target.value)"
        placeholder="Add description..."
        hide-details
        density="compact"
      />
      <p v-else-if="description == ''"><em>No description</em></p>
      <p v-else>{{description}}</p>

      <div v-if="showEditMode" style="display: flex; align-content: center;">
        <span>This recipe makes </span>
        <v-text-field
          :value="servings_per_recipe"
          type="Number"
          @input="emit('update:servings_per_recipe', $event.target.value)"
          style="max-width: 100px"
          hide-details
          density="compact"
        /> <span> servings per recipe</span>
      </div>
      <p v-else><em>This recipe makes {{servings_per_recipe}} servings</em></p>
    </div>
  </div>

  <hr style="width: 100%;"/>

  <div>
    <h3>Recipe Cost:
      <b v-if="showEditMode">${{roundToTwoDecimals(calculated_cost)}}</b>
      <b v-else>${{roundToTwoDecimals(calculated_cost)}}</b>
    </h3>
    <h3>Cost Per Serving:
      <b v-if="showEditMode">${{roundToTwoDecimals(calculated_cost / servings_per_recipe)}}</b>
      <b v-else>${{roundToTwoDecimals(calculated_cost / servings_per_recipe)}}</b>
    </h3>
  </div>
</template>

<style scoped>

</style>

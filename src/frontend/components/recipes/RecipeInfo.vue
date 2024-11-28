<script setup lang="ts">

import { roundToTwoDecimals } from '@/utils/formatUtils'

defineProps<{
  showEditMode: boolean,
  name: string,
  description: string,
  servings_per_recipe: number,
  calculated_cost: number
}>()

const emit = defineEmits(['toggleEditMode'])

</script>

<template>
  <div id="recipeTopArea">
    <div style="width: 100%;">
      <h1 style="display: flex; justify-content: space-between; align-items: center">
        <span>{{name}}</span>
        <font-awesome-icon :icon="['fas', 'pen-to-square']"
                           v-if="!showEditMode"
                           style="cursor: pointer;"
                           @click="emit('toggleEditMode')"/>
        <font-awesome-icon :icon="['fas', 'floppy-disk']"
                           v-if="showEditMode"
                           style="cursor: pointer; color: green"
                           @click="emit('toggleEditMode')"/>
      </h1>

      <p v-if="description == ''"><em>No description</em></p>
      <p v-else>{{description}}</p>

      <p><em>This recipe makes {{servings_per_recipe}} servings</em></p>
    </div>
  </div>

  <hr style="width: 100%;"/>

  <div>
    <h3>Recipe Cost: <b>${{roundToTwoDecimals(calculated_cost)}}</b></h3>
    <h3>Cost Per Serving: <b>${{roundToTwoDecimals(calculated_cost / servings_per_recipe)}}</b></h3>
  </div>
</template>

<style scoped>

</style>

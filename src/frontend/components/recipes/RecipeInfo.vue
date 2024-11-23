<script setup lang="ts">

import { roundToTwoDecimals } from '@/utils/formatUtils'

defineProps<{
  name: string,
  description: string,
  servings_per_recipe: number,
  calculated_cost: number
}>()
</script>

<template>
  <div id="recipeTopArea">
    <div style="width: 100%;">
      <h1 style="display: flex">
        <span>{{name}}</span>
      </h1>

      <p v-if="description == ''"><em>No description</em></p>
      <p v-else>{{description}}</p>

      <p><em>This recipe makes {{servings_per_recipe}} servings</em></p>
    </div>
<!--    <v-btn v-if="true" @click="true">-->
<!--      Cancel-->
<!--    </v-btn>-->
<!--    <v-btn v-if="true" color="green" @click="true">-->
<!--      Save <font-awesome-icon :icon="['fas', 'file-arrow-up']" />-->
<!--    </v-btn>-->
<!--    <v-btn v-else @click="true">-->
<!--      Edit<font-awesome-icon :icon="['fas', 'pen-to-square']" />-->
<!--    </v-btn>-->
  </div>

  <hr style="width: 100%;"/>

  <div>
    <h3>Recipe Cost: <b>${{roundToTwoDecimals(calculated_cost)}}</b></h3>
    <h3>Cost Per Serving: <b>${{roundToTwoDecimals(calculated_cost / servings_per_recipe)}}</b></h3>
  </div>
</template>

<style scoped>

</style>

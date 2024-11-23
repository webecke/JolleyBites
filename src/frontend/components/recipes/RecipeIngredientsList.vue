<script setup lang="ts">
import type { IngredientRecipe } from '../../../shared/types'
import { computed, onMounted, ref } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { roundToTwoDecimals } from '@/utils/formatUtils'

const data = useDataStore()

const {recipeId, ingredientRecipes} = defineProps<{
  recipeId: number
  ingredientRecipes: IngredientRecipe[]
}>()

const ingredientsWithDetails = computed(() =>
  ingredientRecipes.map(ingredient => ({
    ...ingredient,
    details: data.getIngredient(ingredient.ingredient_id)
  }))
)

const getCost = (pricePerUnit: number | undefined, quantityInRecipe: number): string => {
  if (pricePerUnit == undefined) return "Loading..."

  return `$${(pricePerUnit * quantityInRecipe).toFixed(2)}`
}
</script>

<template>
  <div v-if="ingredientsWithDetails.length == 0" class="ingredient">
    <p><em>No ingredients. Add some below.</em></p>
  </div>

  <div class="ingredient"
       v-else
       v-for="ingredient in ingredientsWithDetails"
       :key="ingredient.ingredient_id">
    <div class="ingredient-info">
      <p>{{ingredient.quantity_in_recipe}} {{ingredient.details?.unit}} of {{ingredient.details?.name}}</p>
      <p class="cost">{{getCost(ingredient.details?.price_per_unit, ingredient.quantity_in_recipe)}}</p>
    </div>
  </div>
</template>

<style scoped>
.ingredient {
  width: 95%;
  border-radius: 5px;
  margin-top: 5px;
  padding: 5px 10px 5px 10px;
  background-color: #2c2c2c;
}

.ingredient-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cost {
  margin-left: auto; /* Pushes the cost to the right */
}
</style>

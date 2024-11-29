<script setup lang="ts">
import type { Ingredient, IngredientRecipe } from '../../../shared/types'
import { computed, ref } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { roundToTwoDecimals } from '@/utils/formatUtils'

const data = useDataStore()

const {ingredientRecipes, recipeId} = defineProps<{
  showEditMode: boolean,
  recipeId: number,
  ingredientRecipes: IngredientRecipe[]
}>()

const emit = defineEmits<{
  'update:ingredientRecipes': [ingredients: IngredientRecipe[]]
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

const ingredientToAdd = ref<Ingredient | null | undefined>(null)

const getIngredientPreviewString = (ingredient: Ingredient) => {
  return `${ingredient.name} - $${roundToTwoDecimals(ingredient.price_per_unit)}/${ingredient.unit}`
}

const possibleIngredientsToAdd = computed(() => {
  const list: Ingredient[] = Array.from(useDataStore().ingredients.values())
  const inRecipeIds: number[] = ingredientRecipes.map(ir => ir.ingredient_id)

  return list.filter((ingredient: Ingredient) => {
    return !inRecipeIds.includes(ingredient.id)
  })
})

const addIngredient = () => {
  if (!ingredientToAdd.value) return

  const newIngredient: IngredientRecipe[] = [...ingredientRecipes, {
    recipe_id: recipeId,
    ingredient_id: ingredientToAdd.value.id,
    quantity_in_recipe: 0,
    notes: ''
  }]

  // Emit the update
  emit('update:ingredientRecipes', newIngredient)
  ingredientToAdd.value = null
}

const updateQuantity = (ingredient: IngredientRecipe & { details?: Ingredient }, newValue: string) => {
  const newIngredients = ingredientRecipes.map(ir => {
    if (ir.ingredient_id === ingredient.ingredient_id) {
      return {
        ...ir,
        quantity_in_recipe: Number(newValue)
      }
    }
    return ir
  })

  emit('update:ingredientRecipes', newIngredients)
}
</script>

<template>
  <div v-if="ingredientsWithDetails.length == 0" class="ingredient">
    <p><em>No ingredients. Edit recipe to add</em></p>
  </div>

  <div class="ingredient"
       v-else
       v-for="ingredient in ingredientsWithDetails"
       :key="ingredient.ingredient_id">
    <div class="ingredient-info">
      <div v-if="showEditMode" style="display: flex">
        <v-text-field
          density="compact"
          hide-details
          style="width: 100px"
          type="Number"
          v-model="ingredient.quantity_in_recipe"
          @update:model-value="updateQuantity(ingredient, $event)"
        />
        {{ingredient.details?.unit}} of {{ingredient.details?.name}}
      </div>
      <div v-else>
        <p>{{ingredient.quantity_in_recipe}} {{ingredient.details?.unit}} of {{ingredient.details?.name}}</p>
      </div>
      <p class="cost">{{getCost(ingredient.details?.price_per_unit, ingredient.quantity_in_recipe)}}</p>
    </div>
  </div>

  <div style="margin-top: 15px">
    <h3>Add ingredients</h3>
    <div v-if="showEditMode" style="display: flex; justify-content: center; align-items: center;">
      <v-autocomplete
        v-model="ingredientToAdd"
        :items="possibleIngredientsToAdd"
        :item-title="getIngredientPreviewString"
        hide-details
        return-object
        style="margin-right: 10px"
        no-data-text="No ingredients available to add"
        density="compact"
      />
      <v-btn
        icon
        :disabled="(ingredientToAdd == null)"
        @click="addIngredient">
        <font-awesome-icon :icon="['fas', 'plus']"/>
      </v-btn>
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

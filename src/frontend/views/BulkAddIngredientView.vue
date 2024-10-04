<script setup lang="ts">

import router from '@/router'
import { computed, onMounted, reactive, ref } from 'vue'
import type { Ingredient } from '../../shared/types'

onMounted(() => {
  for (let i = 0; i < 5; i++) {
    addIngredientRow()
  }
})

const addIngredientRow = () => {
  ingredients.value.push( reactive({
    id: 0,
    name: "",
    quantity: 0,
    unit: "",
    purchase_price: 0,
    notes: "",
  }))
}

const save = async () => {
  showErrors.value = true
}

const cancel = async () => {
  router.push("/ingredients")
}

const ingredients = ref<Omit<Ingredient, 'user_id' | 'price_per_unit'>[]>([])

const removeIngredient = (index: number) => {
  ingredients.value.splice(index, 1)
}

const showErrors = ref<boolean>(false)
</script>

<template>
  <h1>Bulk Add Ingredients</h1>
  <p>Use this page if you're adding a lot of ingredients to your list at once.
    Click save or cancel to return to the main ingredients list.</p>
  <v-btn @click="save">Save {{ingredients.length}} Ingredients</v-btn>
  <v-btn @click="cancel">Cancel</v-btn>

  <div class="ingredientRow" v-for="(ingredient, index) in ingredients.values()" :key="ingredient.id">
    <v-text-field
      v-model="ingredient.name"
      class="addIngredientCell"
      label="Ingredient Name"
      :error="showErrors && ingredient.name.length == 0"
    />
    <v-text-field
      v-model="ingredient.quantity"
      class="addIngredientCell"
      type="number"
      label="Quantity Purchased"
      :error="showErrors && ingredient.quantity <= 0"
    />
    <v-text-field
      v-model="ingredient.unit"
      class="addIngredientCell"
      label="Units"
      :error="showErrors && ingredient.unit.length == 0"
    />
    <v-text-field
      v-model="ingredient.purchase_price"
      class="addIngredientCell"
      prefix="$"
      type="number"
      label="Purchase Price"/>
    <v-text-field
      v-model="ingredient.notes"
      class="addIngredientCell"
      label="Notes"/>
    <v-btn icon style="margin-left: 10px" @click="removeIngredient(index)">
      <font-awesome-icon :icon="['fas', 'trash']" />
    </v-btn>
  </div>
  <v-btn @click="addIngredientRow">
    Add Another Ingredient
  </v-btn>

</template>

<style scoped>
.ingredientRow {
  display: flex;
  flex-direction: row;
}
</style>
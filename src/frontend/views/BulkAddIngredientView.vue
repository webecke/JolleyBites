<script setup lang="ts">

import router from '@/router'
import { onMounted, reactive, ref } from 'vue'
import { snackbarStore } from '@/stores/snackbarStore'
import type { ClientGeneratedIngredient } from '../../shared/messages'
import { addIngredientsBatch } from '@/services/IngredientService'
import { useDataStore } from '@/stores/dataStore'
import { doErrorHandling } from '@/utils/generalUtils'

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

const handleSaveButtonClick = async () => {
  showErrors.value = true

  // remove all blank rows
  ingredients.value = ingredients.value.filter((ingredient) => {
    return !((ingredient.name == "") && (ingredient.quantity == 0) && (ingredient.unit == "") && (ingredient.purchase_price == 0) && (ingredient.notes == ""));
  })

  // find if any have missing fields
  ingredientsWithErrors.value = ingredients.value.filter((ingredient) => {
    if (ingredient.quantity <= 0) { return true }
    if (ingredient.name.length <= 0) { return true }
    if (ingredient.unit.length <= 0) { return true }
    return false
  })

  if (ingredientsWithErrors.value.length > 0) {
    showIngredientErrorPopup.value = true
    return
  }

  if (ingredients.value.length == 0) {
    snackbarStore.showWarningMessage("There are no ingredients to save")
    showIngredientErrorPopup.value = false
    addIngredientRow()
    return
  }

  let ingredientsSaved

  await doErrorHandling(async () => {
    const response = await addIngredientsBatch(ingredients.value)
    ingredientsSaved = response.ingredientsIds.length

    await useDataStore().loadIngredients()
    await router.push("/ingredients")
    snackbarStore.showSuccessMessage(`Successfully saved ${ingredientsSaved} new ingredients`)
  }, "saving ingredients")
}

const showIngredientErrorPopup = ref<boolean>(false)

const handleCancelButtonClick = async () => {
  router.push("/ingredients")
}

const ingredients = ref<ClientGeneratedIngredient[]>([])
const ingredientsWithErrors = ref<ClientGeneratedIngredient[]>([])

const removeIngredient = (index: number) => {
  ingredients.value.splice(index, 1)
}

const showErrors = ref<boolean>(false)
</script>

<template>
  <h1>Bulk Add Ingredients</h1>
  <p>Use this page if you're adding a lot of ingredients to your list at once.
    Click save or cancel to return to the main ingredients list.</p>
  <div class="bulkAddActionButtons">
    <v-btn @click="handleSaveButtonClick" color="green">Save {{ingredients.length}} Ingredients</v-btn>
    <v-btn @click="handleCancelButtonClick" color="yellow">Cancel</v-btn>
    <v-btn @click="addIngredientRow">Add Another Ingredient</v-btn>
  </div>

  <div class="ingredientRow" v-for="(ingredient, index) in ingredients.values()" :key="index">
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
  <div class="bulkAddActionButtons">
    <v-btn @click="handleSaveButtonClick" color="green">Save {{ingredients.length}} Ingredients</v-btn>
    <v-btn @click="handleCancelButtonClick" color="yellow">Cancel</v-btn>
    <v-btn @click="addIngredientRow">Add Another Ingredient</v-btn>
  </div>



  <v-dialog
    v-model="showIngredientErrorPopup"
    width="auto"
    min-width="300px"
    max-width="500px"
  >
    <v-card title="Ingredients have errors">
      <template v-slot:text>
        <p>The following ingredients are missing values. Please make sure all red fields are filled in, or remove them.</p>
        <hr style="width: 100%"/>
        <p v-for="(ingredient, index) in ingredientsWithErrors.values()" :key="index">
          {{ ingredient.name.length > 0 ? ingredient.name
          : `Unnamed ingredient with ${ingredient.quantity} ${ingredient.unit.length > 0 ? ingredient.unit : "unnamed units"}` }}
        </p>
      </template>
      <template v-slot:actions>
        <v-btn @click="showIngredientErrorPopup = false">Ok</v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.ingredientRow {
  display: flex;
  flex-direction: row;
}

.bulkAddActionButtons {
  display: flex;
  flex-direction: row;
}

.bulkAddActionButtons > * {
  margin: 10px;
}
</style>
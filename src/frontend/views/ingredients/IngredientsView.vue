<script setup lang="ts">
import type { Ingredient } from '../../../shared/types'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { addIngredient } from '@/services/ingredientService'
import { snackbarStore } from '@/stores/snackbarStore'

onMounted(async () => {
  document.addEventListener('keyup', handleEnterKey);
  await useDataStore().initializeDataStore()
})

const ingredients = computed( () => useDataStore().ingredients)

onUnmounted( () => {
  document.removeEventListener('keyup', handleEnterKey)
})

const headers = [
  { title: 'Ingredient', value: 'name', sortable: true, width: '20%', editable: true },
  { title: 'Quantity', value: 'quantity', sortable: true, type: typeof 0, editable: true},
  { title: 'Unit', value: 'unit', sortable: true, editable: true },
  { title: 'Cost', value: 'purchase_price', sortable: true, type: typeof 0, editable: true},
  { title: 'Price/Unit', value: 'price_per_unit', sortable: true, editable: false },
  { title: 'Notes', value: 'notes', width: '20% ', editable: true}
]

const editableHeaders = computed(() => headers.filter(header => header.editable));

const startEditing = (item: Ingredient, field: keyof Ingredient) => {
  editingId.value = item.id
  editingField.value = field
  editingValue.value = item[field]
  console.log("editing: " + item.name + " " + field)

  if (item) {
    editingValue.value = item[field];
  }
  nextTick(() => {
    if (editField.value) {
      editField.value.focus();
    }
  });
};

const finishEditing = (item: Ingredient) => {
  if (editingField.value == "purchase_price" || editingField.value == "quantity") {
    item.price_per_unit = item.purchase_price / item.quantity
  }

  editingId.value = null;
  editingField.value = null;
  editingValue.value = "";

  console.log('Edited item:', item);
};

const openAddIngredient = () => {
  ingredientToAdd.value = {
    name: "",
    quantity: 0,
    unit: "",
    purchase_price: 0,
    notes: ""
  }
}

const saveNewIngredient = async () => {
  try {
    await addIngredient(ingredientToAdd.value)
  } catch (error) {
    if (error instanceof Error) {
      snackbarStore.showMessage(error.message, {color: "warning", timeout: 10000})
    } else {
      snackbarStore.showMessage("Something went wrong, ingredient wasn't saved", {color: "error", timeout: -1})
    }
    return
  }

  snackbarStore.showMessage(`Successfully added ingredient "${ingredientToAdd.value?.name}"`, {color:"success"})
  openAddIngredient()
}

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    (event.target as HTMLElement).blur();
  }
}

const editingId = ref<string | null>(null);
const editingField = ref<keyof Ingredient | null>(null);
const editingValue = ref<string | number | null>(null);
const editField = ref<HTMLInputElement | null>(null);
const search = ref<string>("")

const ingredientToAdd = ref<Omit<Ingredient, "id" | "price_per_unit" | "user_id"> | null>(null)
</script>

<template>
<div id="ingredientsView">
  <div id="searchAddBar">
    <v-text-field
      v-model="search"
      label="Search your ingredients"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      hide-details
      single-line
    />
    <v-btn v-if="!ingredientToAdd" style="margin: 10px" variant="tonal" @click="openAddIngredient">
      Add Ingredient
      <font-awesome-icon :icon="['fas', 'plus']" />
    </v-btn>
    <v-btn v-else style="margin: 10px" variant="tonal" color="green" @click="saveNewIngredient">
      Save Ingredient
      <font-awesome-icon :icon="['fas', 'file-arrow-up']" />
    </v-btn>
  </div>

  <div id="addIngredient" v-if="ingredientToAdd">
    <v-text-field
      v-model="ingredientToAdd.name"
      label="Ingredient Name"/>
    <v-text-field
      v-model="ingredientToAdd.quantity"
      label="Quantity Purchased"/>
    <v-text-field
      v-model="ingredientToAdd.unit"
      label="Units"/>
    <v-text-field
      v-model="ingredientToAdd.purchase_price"
      label="Purchase Price"/>
    <v-text-field
      v-model="ingredientToAdd.notes"
      label="Notes"/>
  </div>

  <v-data-table
    class="v-theme--dark"
    :headers="headers"
    :items="ingredients"
    :search="search"
    :items-per-page="-1"
    fixed-header
    hide-default-footer
  >
    <template v-for="header in editableHeaders" :key="header.value" #[`item.${header.value}`]="{ item }">

      <div style="width: 100%"
           @click="startEditing(item, header.value as keyof Ingredient)"
           :class="{ 'text-wrap': header.value === 'notes',
                     'red-cell': (item[header.value as keyof Ingredient] === null || item[header.value as keyof Ingredient] === '') && header.value != 'notes' }">

        <span v-if="editingId !== item.id || editingField !== header.value">
          <span v-if="header.value === 'price_per_unit' || header.value === 'purchase_price'">
            {{ "$" + (item[header.value as keyof Ingredient] as number) }}
          </span>
          <span v-else>
            {{ item[header.value as keyof Ingredient] || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0' }}
          </span>
        </span>

        <v-text-field
          v-else
          v-model="item[header.value as keyof Ingredient]"
          @blur="finishEditing(item)"
          @keyup.enter="finishEditing(item)"
          :type="header.type || 'text'"
          dense
          hide-details
          single-line
          ref="editField"
        ></v-text-field>
      </div>
    </template>
    <template v-slot:bottom>
      <div class="d-flex justify-end pa-4">
        <span>You have {{ useDataStore().ingredients.length }} ingredients</span>
      </div>
    </template>
  </v-data-table>
</div>
</template>

<style scoped>
.red-cell {
  background-color: #a60110;
}

#searchAddBar {
  display: flex;
  flex-direction: row;
  align-items: center;
}

#addIngredient {
  display: flex;
  flex-direction: row;
  margin-top: 15px
}
</style>
<script setup lang="ts">
import type { Ingredient } from '../../../shared/types'
import { computed, nextTick, ref } from 'vue'
import { doNathanGet, doTestPut } from '@/services/ingredientService'

let ingredients: Ingredient[] = [
  {id: "idForFlour",
    user_id: "afdsfsafdafds",
    name: "Flour",
    quantity: 100,
    unit: "cups",
    purchasePrice: 50,
    pricePerUnit: 5,
    notes: "fake"},
  {id: "idForSugar",
    user_id: "afdsfsafdafds",
    name: "Sugar",
    quantity: 17,
    unit: "cups",
    purchasePrice: 7,
    pricePerUnit: 1,
    notes: "your mom"},
]

const headers = [
  { title: 'Ingredient', value: 'name', sortable: true, width: '20%' },
  { title: 'quantity', value: 'quantity', type: typeof 0},
  { title: 'Unit', value: 'unit' },
  { title: 'Cost', value: 'purchasePrice', type: typeof 0},
  { title: 'Price/Unit', value: 'pricePerUnit' },
  { title: 'Notes', value: 'notes', width: '20% '}
  // You can comment this out to hide the category
  // { text: 'Category', value: 'category' },
]

const editableHeaders = computed(() => headers.filter(header => header.value !== 'pricePerUnit'));

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
  editingId.value = null;
  editingField.value = null;
  editingValue.value = "";

  // Here you would typically save the changes to your backend
  console.log('Edited item:', item);
};

const test1 = async () => {
  await doTestPut()
}
const test2 = async () => {
  await doNathanGet()
}

const editingId = ref<string | null>(null);
const editingField = ref<keyof Ingredient | null>(null);
const editingValue = ref<string | number | null>(null);
const editField = ref<HTMLInputElement | null>(null);
</script>

<template>
<div id="ingredientsView">
  <v-data-table
    class="v-theme--dark"
    :headers="headers"
    :items="ingredients">
      <template v-for="header in editableHeaders" :key="header.value" #[`item.${header.value}`]="{ item }">

        <div style="width: 100%"
             @click="startEditing(item, header.value as keyof Ingredient)"
             :class="{ 'text-wrap': header.value === 'notes',
                       'red-cell': (item[header.value as keyof Ingredient] === null || item[header.value as keyof Ingredient] === '') && header.value != 'notes' }">

          <span v-if="editingId !== item.id || editingField !== header.value">
            {{ item[header.value as keyof Ingredient] || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0' }}
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
  </v-data-table>
  <v-btn @click="test1">TEST ME</v-btn>
  <v-btn @click="test2">WHY IS THIS BROKEN 200</v-btn>
</div>
</template>

<style scoped>
.red-cell {
  background-color: #a60110;
}
</style>
<script setup lang="ts">
import type { Ingredient } from '../../shared/types'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { addIngredient, deleteIngredients, updateIngredient } from '@/services/IngredientService'
import { snackbarStore } from '@/stores/snackbarStore'
import router from '@/router'
import type { IngredientRequest } from '../../shared/request/IngredientRequests'
import { doErrorHandling } from '@/utils/generalUtils'

onMounted(async () => {
  document.addEventListener('keyup', handleEnterKey);
})

const ingredients = computed( () => Array.from(useDataStore().ingredients.values()))

onUnmounted( () => {
  document.removeEventListener('keyup', handleEnterKey)
})

const headers = [
  { title: 'Ingredient', value: 'name', sortable: true, width: '20%', editable: true },
  { title: 'Quantity', value: 'quantity', sortable: true, type: "number", prefix: "$", editable: true},
  { title: 'Unit', value: 'unit', sortable: true, editable: true },
  { title: 'Cost', value: 'purchase_price', sortable: true, type: "number", prefix: "$", editable: true},
  { title: 'Price/Unit', value: 'price_per_unit', sortable: true, type: "number", editable: false },
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

const finishEditing = async (item: Ingredient) => {
  if (editingField.value == "purchase_price" || editingField.value == "quantity") {
    item.price_per_unit = item.purchase_price / item.quantity
  }

  editingId.value = null;
  editingField.value = null;
  editingValue.value = "";

  try {
    await updateIngredient(item, item.id)
  } catch (error) {
    console.error(error)
    snackbarStore.showCriticalErrorMessage("Something went wrong saving your changes. Please refresh the page")
    return
  }
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

const deleteSelected = async () => {
  const countDeleting = selected.value.length

  await doErrorHandling(async () => {
    await deleteIngredients(selected.value)

    deleteWarning.value = false
    snackbarStore.showSuccessMessage(`Successfully deleted ${countDeleting} ingredients`)
    selected.value = []
  }, "deleting ingredients")
}

const saveNewIngredient = async () => {
  await doErrorHandling(async () => {
    await addIngredient(ingredientToAdd.value)
    snackbarStore.showSuccessMessage(`Successfully added ingredient "${ingredientToAdd.value?.name}"`)
    openAddIngredient()
  }, "saving ingredient")
}

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    (event.target as HTMLElement).blur();
  }
}

const editingId = ref<number | null>(null);
const editingField = ref<keyof Ingredient | null>(null);
const editingValue = ref<string | number | null>(null);
const editField = ref<HTMLInputElement | null>(null);
const search = ref<string>("")
const selected = ref<number []>([])
const deleteWarning = ref<boolean>(false)

const ingredientToAdd = ref<IngredientRequest | null>(null)
</script>

<template>
<div id="ingredientsView">
  <h1>My Ingredients</h1>
  <p>Here is where you save all of your ingredients. All of your recipes pull from this list.
    Click on ingredients on the list to edit them.</p>

  <div id="searchAddBar">
    <v-text-field
      v-model="search"
      label="Search your ingredients"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      hide-details
      single-line
    />

    <!-- Bulk add / delete button -->
    <v-btn v-if="selected.length" color="red" style="margin: 10px" @click="deleteWarning = true">
      Delete {{selected.length}} Selected
      <i class="fa-regular fa-trash-can"></i>
    </v-btn>
    <v-btn v-else style="margin: 10px" variant="tonal" @click="router.push('/ingredients/add')">
      Bulk Add
    </v-btn>
    <!--------------------------->
    <!-- Add ingredient button -->
    <v-btn v-if="!ingredientToAdd" style="margin: 10px" @click="openAddIngredient">
      Add
      <font-awesome-icon :icon="['fas', 'plus']" />
    </v-btn>
    <v-btn v-else style="margin: 10px" color="green" @click="saveNewIngredient">
      Save Ingredient
      <font-awesome-icon :icon="['fas', 'file-arrow-up']" />
    </v-btn>
    <!--------------------------->
  </div>

  <div id="addIngredient" v-if="ingredientToAdd">
    <v-text-field
      v-model="ingredientToAdd.name"
      class="addIngredientCell"
      label="Ingredient Name"/>
    <v-text-field
      v-model="ingredientToAdd.quantity"
      class="addIngredientCell"
      type="number"
      label="Quantity Purchased"/>
    <v-text-field
      v-model="ingredientToAdd.unit"
      class="addIngredientCell"
      label="Units"/>
    <v-text-field
      v-model="ingredientToAdd.purchase_price"
      class="addIngredientCell"
      prefix="$"
      type="number"
      label="Purchase Price"/>
    <v-text-field
      v-model="ingredientToAdd.notes"
      class="addIngredientCell"
      label="Notes"/>
  </div>

  <v-data-table
    class="v-theme--dark"
    v-model="selected"
    :headers="headers"
    :items="ingredients"
    :search="search"
    :items-per-page="-1"
    fixed-header
    hide-default-footer
    show-select
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
        <span>You have {{ useDataStore().ingredients.size }} ingredients</span>
      </div>
    </template>
  </v-data-table>
</div>


  <v-dialog
    v-model="deleteWarning"
    width="auto"
    min-width="300px"
  >
    <v-card title="Are you sure?">
      <template v-slot:text>
        <p>You are about to delete {{ selected.length }} ingredients. You can not undo this.</p>
      </template>
      <template v-slot:actions>
        <v-btn @click="deleteSelected" color="red">Yes, delete</v-btn>
        <v-btn @click="deleteWarning = false">No, cancel</v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<style scoped>


.red-cell {
  background-color: #a60110;
}

#searchAddBar {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 10px;
}

#addIngredient {
  display: flex;
  flex-direction: row;
}

.addIngredientCell {
  margin: 5px;
}
</style>

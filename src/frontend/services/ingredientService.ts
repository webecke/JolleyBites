import { useDataStore } from '@/stores/dataStore'
import type { Ingredient } from '../../shared/types'
import { snackbarStore } from '@/stores/snackbarStore'

export const getAllIngredients = async (): Promise<Ingredient []> => {
  const response = await fetch(generateBaseUrl() + "/api/ingredients", {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    console.error('Error:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('Error details:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json() as Ingredient[];
}

const newIngredientPost = async (ingredient: Omit<Ingredient, "id">) => {
  const response = await fetch(generateBaseUrl() + "/api/ingredients", {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ingredient: ingredient
    })
  });

  if (!response.ok) {
    console.error('Error:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('Error details:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json() as {id: number};
};

export const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'price_per_unit' | 'user_id'> | null)=> {
  if (ingredient == null) {
    console.error("Tried to add null ingredient");
    throw Error("Tried to add null ingredient")
  } if ((ingredient.name == "") || (ingredient.quantity == 0) || (ingredient.unit == "")) {
    throw Error("Please enter an ingredient name, quantity, and unit")
  }

  const submittableIngredient = {
    user_id: "GENERIC",
    name: ingredient.name,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    purchase_price: ingredient.purchase_price,
    price_per_unit: (ingredient.purchase_price / ingredient.quantity),
    notes: ingredient.notes
  }

  const response = await newIngredientPost(submittableIngredient);

  const newIngredient: Ingredient = { ...submittableIngredient, ...response }
  useDataStore().addIngredient(newIngredient)
}

export const doTestPut = async () => {
  const response = await fetch(generateBaseUrl() + "/api/ingredients", {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ingredient: {
        user_id: "GENERIC",
        name: "Sugar",
        quantity: 32,
        unit: "cups",
        purchasePrice: 3200,
        pricePerUnit: 1,
        notes: "maybe this works"
      }
    })
  });

  if (!response.ok) {
    console.error('Error:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('Error details:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  console.log(await response.text())
  console.log(await response.headers)
  console.log(await response.body)
  console.log(response)
  return "success";
};

export const doNathanGet = async () => {
  const response = await fetch(generateBaseUrl() + "/api/nathan", {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Error:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('Error details:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  console.log(await response.text())
  console.log(await response.headers)
  console.log(await response.body)
  console.log(response)
  return "success";
};

function generateBaseUrl() {
  let baseUrl = window.location.origin
  if (baseUrl.startsWith("http://localhost")) {
    baseUrl = "http://localhost:8788"
  }
  return baseUrl
}
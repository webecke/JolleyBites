export type IngredientRequest = {
  name: string,
  quantity: number,
  unit: string,
  purchase_price: number,
  notes: string
}

export function isValidIngredientRequest(request: unknown): request is IngredientRequest {
  if (typeof request !== 'object' || request === null) return false;

  // Type assert to access properties safely
  const r = request as Record<string, unknown>;

  //if (typeof r.name !== 'string' || r.name.trim() === '') {console.error("name"); return false;}
  if (typeof r.unit !== 'string' || r.unit.trim() === '') {console.error("unit"); return false;}
  if (typeof r.notes !== 'string') {console.error("notes"); return false;}
  if (typeof r.quantity !== 'number' || isNaN(r.quantity)) {console.error("quantity"); return false;}
  if (typeof r.purchase_price !== 'number' || isNaN(r.purchase_price)) {console.error("price"); return false;}

  // Check numeric constraints
  return r.quantity > 0 && r.purchase_price >= 0;
}

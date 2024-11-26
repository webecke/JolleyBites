export type NewIngredientRequest = {
  name: string,
  quantity: number,
  unit: string,
  purchase_price: number,
  notes: string
}

export function isValidNewIngredientRequest(request: unknown): request is NewIngredientRequest {
  console.log(request)
  if (typeof request !== 'object' || request === null) return false;

  // Type assert to access properties safely
  const r = request as Record<string, unknown>;

  if (typeof r.name !== 'string' || r.name.trim() === '') return false;
  if (typeof r.unit !== 'string' || r.unit.trim() === '') return false;
  if (typeof r.notes !== 'string') return false;
  if (typeof r.quantity !== 'number' || isNaN(r.quantity)) return false;
  if (typeof r.purchase_price !== 'number' || isNaN(r.purchase_price)) return false;

  // Check numeric constraints
  return r.quantity > 0 && r.purchase_price >= 0;
}

// import type { Env } from './worker'
// import { IngredientsDataAccess } from '../dataAccess/ingredientsDataAccess'
// import { HttpError } from './worker'
// import type { Ingredient } from '../../shared/types'
//
// export async function handleIngredientsRequest(path: String, request: Request, env: Env): Promise<Response> {
//   const requestType = request.method
//   const ingredientsDataAccess = new IngredientsDataAccess(env.DB)
//
//   switch (requestType) {
//
//     case "GET":
//       return new Response(JSON.stringify(await ingredientsDataAccess.getIngredientsForUser("GENERIC")), { status: 200 });
//
//     case "POST":
//       const reqBody: any = await request.json()
//       if (!('ingredient' in reqBody)) {
//         throw HttpError.badRequest(`Missing ingredient`);
//       }
//       const ingredient = validateIngredient(reqBody.ingredient)
//
//       try {
//         await ingredientsDataAccess.insertIngredient(ingredient)
//       } catch(error) {
//         throw HttpError.internalServerError("Something went wrong inserting ingredient into database: " + ingredient)
//       }
//       return new Response("Successfully added ingredient to database", { status: 201 })
//     default:
//       console.error(requestType)
//       throw HttpError.methodNotAllowed("")
//   }
// }
//
// function validateIngredient(data: any): Omit<Ingredient, 'id'> {
//   const requiredFields: (keyof Omit<Ingredient, 'id'>)[] = [
//     'user_id', 'name', 'quantity', 'unit', 'purchasePrice', 'pricePerUnit', 'notes'
//   ];
//
//   for (const field of requiredFields) {
//     if (!(field in data)) {
//       throw HttpError.badRequest(`Missing required field: ${field}`);
//     }
//   }
//
//   const validatedIngredient: Omit<Ingredient, 'id'> = {
//     user_id: String(data.user_id),
//     name: String(data.name),
//     quantity: Number(data.quantity),
//     unit: String(data.unit),
//     purchasePrice: Number(data.purchasePrice),
//     pricePerUnit: Number(data.pricePerUnit),
//     notes: data.notes ? String(data.notes) : ''
//   };
//
//   return validatedIngredient;
// }
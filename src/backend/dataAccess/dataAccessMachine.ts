import { AuthDataAccess } from './authDataAccess'
import { IngredientsDataAccess } from './ingredientsDataAccess'
import { UserDataAccess } from './userDataAccess'
import { D1Database } from '@cloudflare/workers-types';
import { RecipeDataAccess } from './recipeDataAccess'
import { RecipeIngredientDataAccess } from './recipeIngredientDataAccess'


export class DataAccessMachine {

  private DB: D1Database

  constructor(DB: D1Database) {
    this.DB = DB

    this.authDataAccess = new AuthDataAccess(DB)
    this.ingredientDataAccess = new IngredientsDataAccess(DB)
    this.userDataAccess = new UserDataAccess(DB)
    this.recipeDataAccess = new RecipeDataAccess(DB)
    this.recipeIngredientAccess = new RecipeIngredientDataAccess(DB)
  }

  private readonly authDataAccess: AuthDataAccess
  private readonly ingredientDataAccess: IngredientsDataAccess
  private readonly userDataAccess: UserDataAccess
  private readonly recipeDataAccess: RecipeDataAccess
  private readonly recipeIngredientAccess: RecipeIngredientDataAccess


  public getAuthDA(): AuthDataAccess{
    return this.authDataAccess
  }

  public getUserDA(): UserDataAccess {
    return this.userDataAccess
  }

  public getIngredientsDA(): IngredientsDataAccess {
    return this.ingredientDataAccess
  }

  public getRecipeDA(): RecipeDataAccess {
    return this.recipeDataAccess
  }

  public getRecipeIngredientDA(): RecipeIngredientDataAccess {
    return this.recipeIngredientAccess
  }
}

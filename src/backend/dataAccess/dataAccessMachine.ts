import { AuthDataAccess } from './authDataAccess'
import { IngredientsDataAccess } from './ingredientsDataAccess'
import { UserDataAccess } from './userDataAccess'
import { D1Database } from '@cloudflare/workers-types';


export class DataAccessMachine {

  private DB: D1Database

  constructor(DB: D1Database) {
    this.DB = DB

    this.authDataAccess = new AuthDataAccess(DB)
    this.ingredientDataAccess = new IngredientsDataAccess(DB)
    this.userDataAccess = new UserDataAccess(DB)
  }

  private authDataAccess: AuthDataAccess
  private ingredientDataAccess: IngredientsDataAccess
  private userDataAccess: UserDataAccess

  public getAuthDA(): AuthDataAccess{
    return this.authDataAccess
  }

  public getUserDA(): UserDataAccess {
    return this.userDataAccess
  }

  public getIngredientsDA(): IngredientsDataAccess {
    return this.ingredientDataAccess
  }
}
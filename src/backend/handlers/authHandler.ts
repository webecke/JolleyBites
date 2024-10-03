import { Request as CfRequest } from '@cloudflare/workers-types'
import type { Env } from '../defaultWorker'
import { parseNextApiToken } from '../../../functions/requestTools'
import { HttpError } from '../errors/HttpError'
import type { LoginRequest, RegisterRequest, LoginRegisterResponse } from '../../shared/messages'
import type { User } from '../../shared/types'
import { isAcceptablePassword } from '../../shared/acceptablePassword'
import * as bcrypt from 'bcryptjs'
import { AuthTokenPayload, generateToken, verifyToken } from '../utils/authTokenUtils'
import { DataAccessMachine } from '../dataAccess/dataAccessMachine'
import { MILLISECONDS_TO_LIVE } from '../utils/authTokenUtils'
import { da } from 'vuetify/locale'

const SALT_ROUNDS:number = 10;
export async function handleAuthRequest (path: String, request: CfRequest, env: Env): Promise<Response> {
  const {apiToken, apiPath} = parseNextApiToken(path)

  const dataAccessMachine = new DataAccessMachine(env.DB)

  if (request.method === "POST") {
    switch (apiToken) {
      case "login":
        return await handleLoginRequest(await request.json<LoginRequest>(), dataAccessMachine);
      case "register":
        return await handleRegisterRequest(await request.json<RegisterRequest>(), dataAccessMachine);
      default:
        throw HttpError.notFound("That POST endpoint wasn't found")
    }
  } else if (request.method ==="GET") {
    switch (apiToken) {
      case "me":
        return await handleMeRequest(request, dataAccessMachine);
      default:
        throw HttpError.notFound("That GET endpoint wasn't found")
    }

  } else {
    throw HttpError.methodNotAllowed("Only POST and GET calls are allowed on /auth")
  }
}

async function handleLoginRequest(request: LoginRequest, dataAccess: DataAccessMachine): Promise<Response> {
  const userDataAccess = dataAccess.getUserDA();
  const user: User | null = await userDataAccess.getUserByEmail(request.email)

  if (user == null) { throw HttpError.notFound("User not found with that email")}

  const hashed_password: string | null = await userDataAccess.getPasswordHashByEmail(request.email)

  if (hashed_password == null) { throw HttpError.internalServerError("Error checking password from database")}

  if (!await bcrypt.compare(request.password, hashed_password)) { throw HttpError.forbidden("Incorrect password") }

  return finalizeLogin(user.id, dataAccess)
}

async function handleRegisterRequest(request: RegisterRequest, dataAccess: DataAccessMachine): Promise<Response> {
  if (!isAcceptablePassword(request.password)) {
    throw HttpError.badRequest("Password doesn't meet requirements")
  }

  const userDataAccess = dataAccess.getUserDA()

  if (await userDataAccess.getUserByEmail(request.email)) {
    throw HttpError.conflict("Account already exists with that email")
  }

  const now = new Date().toISOString();
  const user: Omit<User, 'id'> = {
    name: request.name,
    email: request.email,
    created_at: now,
    password_changed_at: now,
    last_login: now
  }

  const hashedPassword = await bcrypt.hash(request.password, SALT_ROUNDS)
  const userId = await userDataAccess.insertUser(user, hashedPassword)

  return finalizeLogin(userId, dataAccess)
}

async function finalizeLogin(userId: string, dataAccess: DataAccessMachine): Promise<Response> {
  const authDataAccess = dataAccess.getAuthDA()
  const userDataAccess = dataAccess.getUserDA()

  const dataBaseUser = await userDataAccess.getUserById(userId) as User

  const fetchedUser: User = {
    id: userId,
    name: dataBaseUser.name,
    email: dataBaseUser.email,
    last_login: dataBaseUser.last_login,
    created_at: dataBaseUser.created_at,
    password_changed_at: dataBaseUser.password_changed_at
  }
  const authToken = await generateToken(fetchedUser)
  const expires_at = await authDataAccess.insertToken(authToken, userId)
  const response: LoginRegisterResponse = {
    user: fetchedUser,
    authToken: {
      token: authToken,
      expires_at: expires_at
    }
  }

  return new Response(JSON.stringify(response), {status: 201})
}

async function handleMeRequest(request: CfRequest, dataAccessMachine: DataAccessMachine): Promise<Response> {
  const authorization = request.headers.get("Authorization")
  if (authorization == null) { throw HttpError.unauthorized("No auth token provided")}

  const authPayload: AuthTokenPayload | null = await verifyToken(authorization)

  if (authPayload == null) { throw HttpError.unauthorized("Invalid auth token provided") }

  const userDataAccess = dataAccessMachine.getUserDA()
  const user: User = await userDataAccess.getUserById(authPayload.user_id)

  return new Response(JSON.stringify(user), {status:200})
}
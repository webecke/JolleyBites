import { Request as CfRequest } from '@cloudflare/workers-types'
import type { Env } from '../../../functions/requestTools'
import { parseNextApiToken } from '../../../functions/requestTools'
import { ServerError } from '../network/ServerError'
import type { LoginRequest, RegisterRequest, LoginRegisterResponse } from '../../shared/messages'
import type { User } from '../../shared/types'
import { isAcceptablePassword } from '../../shared/acceptablePassword'
import * as bcrypt from 'bcryptjs'
import type {AuthTokenPayload} from '../utils/authTokenUtils'
import { generateToken, verifyToken } from '../utils/authTokenUtils'
import { DataAccessMachine } from '../dataAccess/dataAccessMachine'
import type { AuthDataAccess } from '../dataAccess/authDataAccess'

const SALT_ROUNDS:number = 10;

export async function handleAuthRequest (path: String, request: CfRequest, env: Env): Promise<Response> {
  const {apiToken} = parseNextApiToken(path)

  const dataAccessMachine = new DataAccessMachine(env.DB)

  if (request.method === "POST") {
    switch (apiToken) {
      case "login":
        return await handleLoginRequest(await request.json<LoginRequest>(), dataAccessMachine);
      case "register":
        return await handleRegisterRequest(await request.json<RegisterRequest>(), dataAccessMachine);
      default:
        throw ServerError.notFound("That POST endpoint wasn't found")
    }
  } else if (request.method ==="GET") {
    switch (apiToken) {
      case "me":
        return await handleMeRequest(request, dataAccessMachine);
      default:
        throw ServerError.notFound("That GET endpoint wasn't found")
    }

  } else if (request.method == 'DELETE') {
    switch (apiToken) {
      case "logout":
        return await handleLogoutRequest(request, dataAccessMachine)
      default:
        throw ServerError.notFound("That DELETE endpoint wasn't found")
    }
  } else {
    throw ServerError.methodNotAllowed("Only POST, GET, and DELETE calls are allowed on /auth")
  }
}

async function handleLoginRequest(request: LoginRequest, dataAccess: DataAccessMachine): Promise<Response> {
  const userDataAccess = dataAccess.getUserDA();
  const user: User | null = await userDataAccess.getUserByEmail(request.email)

  if (user == null) { throw ServerError.notFound("User not found with that email")}

  const hashed_password: string | null = await userDataAccess.getPasswordHashByEmail(request.email)

  if (hashed_password == null) { throw ServerError.internalServerError("Error checking password from database", null)}

  if (!await bcrypt.compare(request.password, hashed_password)) { throw ServerError.forbidden("Incorrect password") }

  return finalizeLogin(user.id, dataAccess)
}

async function handleRegisterRequest(request: RegisterRequest, dataAccess: DataAccessMachine): Promise<Response> {
  if (!isAcceptablePassword(request.password)) {
    throw ServerError.badRequest("Password doesn't meet requirements")
  }

  const userDataAccess = dataAccess.getUserDA()

  if (await userDataAccess.getUserByEmail(request.email)) {
    throw ServerError.conflict("Account already exists with that email")
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
  const user: User | null = await getUserFromRequest(request, dataAccessMachine)

  return new Response(JSON.stringify(user), {status:200})
}


async function handleLogoutRequest(request: CfRequest, dataAccessMachine: DataAccessMachine): Promise<Response> {
  const user: User | null = await getUserFromRequest(request, dataAccessMachine)
  const authDataAccess: AuthDataAccess = dataAccessMachine.getAuthDA()

  await authDataAccess.deleteToken(request.headers.get("Authorization")!)

  return new Response(JSON.stringify({message: "Successfully logged out"}))
}

async function getUserFromRequest(request: CfRequest, dataAccessMachine: DataAccessMachine): Promise<User | null> {
  const authorization = request.headers.get("Authorization")
  if (authorization == null) { throw ServerError.unauthorized("No auth token provided")}

  const authPayload: AuthTokenPayload | null = await verifyToken(authorization)
  if (authPayload == null) { throw ServerError.unauthorized("Invalid auth token provided") }

  const authDataAccess: AuthDataAccess = dataAccessMachine.getAuthDA()
  if (!await authDataAccess.isTokenInTableAndNotExpired(authorization, new Date().toISOString())) {
    throw ServerError.unauthorized("Auth token has been revoked"); //we know it was revoked because verifyToken would return null if the token is past expiration
  }

  if (Math.random() < 0.01) { // 1% chance to run cleanup
    console.log("Running auth token table clean up")
    await authDataAccess.deleteTokensExpiredAtTime(new Date().toISOString());
  }

  const userDataAccess = dataAccessMachine.getUserDA()
  const user: User | null = await userDataAccess.getUserById(authPayload.user_id)
  return user
}

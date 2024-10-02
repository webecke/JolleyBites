import { Request as CfRequest } from '@cloudflare/workers-types'
import type { Env } from '../defaultWorker'
import { parseNextApiToken } from '../../../functions/requestTools'
import { HttpError } from '../errors/HttpError'
import type { LoginRequest, RegisterRequest, LoginRegisterResponse } from '../../shared/messages'
import { UserDataAccess } from '../dataAccess/userDataAccess'
import type { User } from '../../shared/types'
import { isAcceptablePassword } from '../../shared/acceptablePassword'
import * as bcrypt from 'bcryptjs'
import { generateToken } from '../utils/authTokenUtils'

const SALT_ROUNDS:number = 10;
export async function handleAuthRequest (path: String, request: CfRequest, env: Env): Promise<Response> {
  const {apiToken, apiPath} = parseNextApiToken(path)

  const userDataAccess = new UserDataAccess(env.DB)

  if (request.method === "POST") {
    switch (apiToken) {
      case "login":
        return await handleLoginRequest(await request.json<LoginRequest>(), userDataAccess);
      case "register":
        return await handleRegisterRequest(await request.json<RegisterRequest>(), userDataAccess);
      default:
        throw HttpError.notFound("That POST endpoint wasn't found")
    }
  } else if (request.method ==="GET") {
    switch (apiToken) {
      case "me":
        return await handleMeRequest(request, userDataAccess);
      default:
        throw HttpError.notFound("That GET endpoint wasn't found")
    }

  } else {
    throw HttpError.methodNotAllowed("Only POST and GET calls are allowed on /auth")
  }
}

async function handleLoginRequest(request: LoginRequest, userDataAccess: UserDataAccess): Promise<Response> {

  throw HttpError.notImplemented("Haven't made it yet")
}

async function handleRegisterRequest(request: RegisterRequest, userDataAccess: UserDataAccess): Promise<Response> {
  if (!isAcceptablePassword(request.password)) {
    throw HttpError.badRequest("Password doesn't meet requirements")
  }
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
  const dataBaseUser = await userDataAccess.getUserById(userId) as User

  const fetchedUser: User = {
    id: userId,
    name: dataBaseUser.name,
    email: dataBaseUser.email,
    last_login: dataBaseUser.last_login,
    created_at: dataBaseUser.created_at,
    password_changed_at: dataBaseUser.password_changed_at
  }
  const response: LoginRegisterResponse = {
    user: fetchedUser,
    authToken: { token: await generateToken(fetchedUser) }
  }

  return new Response(JSON.stringify(response), {status: 201})
}

async function handleMeRequest(request: CfRequest, userDataAccess: UserDataAccess): Promise<Response> {
  const test = request.headers.get("Authorization")
  throw HttpError.notImplemented(`working on it: ${test}`)
}
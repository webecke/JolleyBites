import type { User } from '../../shared/types'
// The import says its broken but it's not
// @ts-ignore
import { jwtVerify, SignJWT } from 'jose'
import { HttpError } from '../errors/HttpError'

const JWT_SECRET = new TextEncoder().encode("THIS IS A TEMP SECRET UNTIL I HOOK UP CLOUDFLARE KV")
const MINUTES_TO_LIVE: number = 480

export async function generateToken(user: User): Promise<string> {
  const now = new Date();
  const expire = new Date(now.getTime() + MINUTES_TO_LIVE * 60000); // Convert minutes to milliseconds

  const payload: AuthTokenPayload = {
    user_id: user.id,
    issued_at: now.toISOString(),
    last_used: now.toISOString()
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(expire)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthTokenPayload | string> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const authPayload = payload as AuthTokenPayload;

    if (!authPayload.user_id || !authPayload.issued_at || !authPayload.last_used) {
      throw HttpError.badRequest('Invalid token payload');
    }

    return authPayload;
  } catch (error) {
    return 'Invalid token';
  }
}

export type AuthTokenPayload = {
  user_id: string,
  issued_at: string,
  last_used: string
}
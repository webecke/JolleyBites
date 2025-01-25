import type { User } from '../../shared/types'
// The import says its broken but it's not
// @ts-ignore
import { jwtVerify, SignJWT } from 'jose'
import { ServerError } from '../network/ServerError'

const JWT_SECRET = new TextEncoder().encode("THIS IS A TEMP SECRET UNTIL I HOOK UP CLOUDFLARE KV")
export const MILLISECONDS_TO_LIVE: number = 480 * 60000 // 60000 milliseconds per minute

export async function generateToken(user: User): Promise<string> {
  const now = new Date();
  const expire = new Date(now.getTime() + MILLISECONDS_TO_LIVE);

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

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const authPayload = payload as AuthTokenPayload;

    if (!authPayload.user_id || !authPayload.issued_at || !authPayload.last_used) {
      throw ServerError.badRequest('Invalid token payload');
    }

    return authPayload;
  } catch (error) {
    return null;
  }
}

export type AuthTokenPayload = {
  user_id: string,
  issued_at: string,
  last_used: string
}

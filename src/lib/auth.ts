import crypto from 'crypto';
import { cookies } from 'next/headers';
import { query } from './db';

const SESSION_COOKIE = 'ddv_session';
const SECRET = process.env.SESSION_SECRET || 'data-da-virada-dev-secret-change-me';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function createSessionToken(userId: number): string {
  const payload = JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  const encoded = base64url(payload);
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string | undefined): number | null {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    if (typeof payload.uid !== 'number' || payload.exp < Date.now()) return null;
    return payload.uid;
  } catch {
    return null;
  }
}

export function setSessionCookie(userId: number) {
  cookies().set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  extra_mensal: number;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const uid = verifySessionToken(token);
  if (!uid) return null;
  const rows = await query<{ id: number; name: string; email: string; extra_mensal: string }>(
    'SELECT id, name, email, extra_mensal FROM users WHERE id = $1',
    [uid]
  );
  const user = rows[0];
  return user ? { ...user, extra_mensal: Number(user.extra_mensal) } : null;
}

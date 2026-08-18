import { cookies } from 'next/headers';

// Simple token-based auth for demo (in production, use JWT or NextAuth)
const SESSION_COOKIE = 'gcrm_session';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function createSession(user: SessionUser): Promise<void> {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  const cookie = await cookies();
  cookie.set(SESSION_COOKIE, payload, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookie = await cookies();
  const token = cookie.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token, 'base64url').toString()) as SessionUser;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookie = await cookies();
  cookie.delete(SESSION_COOKIE);
}

// Simple password hashing (use bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'gcrm_salt_2025');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hash;
}

/**
 * Password hashing (scrypt, node built-in) + cookie-based session management.
 *
 * Sessions are stored in the `sessions` table; the browser holds an httpOnly
 * `session` cookie containing the opaque token. Sessions live 30 days.
 */
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

export const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60; // 30 days

// ---------------------------------------------------------------------------
// Password hashing (scrypt). Stored format: "scrypt$<salt-hex>$<hash-hex>"
// ---------------------------------------------------------------------------

const SCRYPT_KEYLEN = 64;
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };

// Manual promise wrapper: the @types/node overloads for promisified scrypt
// don't expose the options argument, so we wrap the callback form directly.
function scryptAsync(password: string, salt: Buffer, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, keylen, SCRYPT_OPTS, (err, derived) => {
      if (err) reject(err);
      else resolve(derived as Buffer);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, saltHex, hashHex] = stored.split("$");
    if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = await scryptAsync(password, salt, SCRYPT_KEYLEN);
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export type SessionUser = { id: number; name: string; handle: string; email: string };

function setSessionCookie(token: string) {
  // next/headers cookies() is async in Next 16.
  return cookies().then((store) =>
    store.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SEC,
      secure: process.env.NODE_ENV === "production",
    }),
  );
}

/** Create a session row + cookie for a user. Returns the token. */
export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);
  // Delete expired sessions opportunistically (best effort, never blocks login).
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date())).catch(() => {});
  await db.insert(sessions).values({ userId, token, expiresAt });
  await setSessionCookie(token);
  return token;
}

/** Look up the logged-in user from the `session` cookie. Returns null when logged out. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      handle: users.handle,
      email: users.email,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!row) return null;
  return { id: row.id, name: row.name, handle: row.handle, email: row.email };
}

/** Delete the current session row + clear the cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token)).catch(() => {});
  }
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

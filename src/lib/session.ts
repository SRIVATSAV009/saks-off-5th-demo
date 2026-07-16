import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { db } from "@/lib/db";

const SESSION_COOKIE = "saks_session";
const ADMIN_COOKIE = "saks_admin_session";
const secret = process.env.SESSION_SECRET ?? "insecure-dev-secret";

// Demo-grade auth: an HMAC-signed cookie holding the user id, no JWT
// library or external session store needed. Good enough for a local
// portfolio project; a real deployment would use rotating secrets and
// server-side session storage.
function sign(value: string) {
  const sig = crypto.createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${sig}`;
}

function unsign(signed: string | undefined): string | null {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", secret).update(value).digest("hex");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  return value;
}

export async function createUserSession(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroyUserSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  return unsign(store.get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return db.user.findUnique({ where: { id: userId } });
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

// For use in server actions invoked from forms that are only ever rendered
// for signed-in users: bounces a stray/unauthenticated submission back to
// login instead of surfacing a raw server error.
export async function requireUserIdOrRedirect(nextPath: string): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return userId;
}

// Business Manager admin session — intentionally separate from storefront
// customer auth, mirroring how BM users are distinct from shopper accounts.
export async function createAdminSession() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, sign("admin"), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return unsign(store.get(ADMIN_COOKIE)?.value) === "admin";
}

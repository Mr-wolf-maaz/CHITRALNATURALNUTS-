import crypto from "crypto";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";

const SECRET = process.env.ADMIN_SECRET ?? "chitral-admin-dev-secret";
export const ADMIN_COOKIE = "chitral_admin_session";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

function hmac(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function makeToken(): string {
  const payload = `admin:${Date.now()}`;
  return `${payload}.${hmac(payload)}`;
}

export function verifyToken(token?: string | null): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payload.startsWith("admin:")) return false;
  // 7-day absolute expiry baked into the signed payload
  const issued = Number(payload.split(":")[1]);
  if (!Number.isFinite(issued) || Date.now() - issued > SEVEN_DAYS * 1000) return false;
  const expected = hmac(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdminAuthed(req?: NextRequest): Promise<boolean> {
  // Channel 1: Bearer token (works inside cross-site iframes)
  const h = await headers();
  const auth = h.get("authorization");
  if (auth?.startsWith("Bearer ") && verifyToken(auth.slice(7))) return true;
  // Channel 2: signed token via query param (survives header-stripping privacy tools)
  const q = req?.nextUrl.searchParams.get("token");
  if (q && verifyToken(q)) return true;
  // Channel 3: httpOnly cookie (works in normal first-party browsing)
  const store = await cookies();
  return verifyToken(store.get(ADMIN_COOKIE)?.value);
}

export function adminCredentials(): { email: string; password: string } {
  return {
    email: process.env.ADMIN_EMAIL ?? "admin@chitralnuts.com",
    password: process.env.ADMIN_PASSWORD ?? "admin123",
  };
}

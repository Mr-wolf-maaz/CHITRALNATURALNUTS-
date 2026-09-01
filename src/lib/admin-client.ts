"use client";

const KEY = "chitral_admin_token";

// In-memory primary store — browsers that block third-party site data also
// block localStorage inside cross-site iframes, but JS memory always works
// for the lifetime of the page (the admin panel runs as an SPA).
let memoryToken: string | null = null;

export function saveAdminToken(token: string) {
  memoryToken = token;
  try {
    localStorage.setItem(KEY, token);
  } catch {
    /* storage blocked — in-memory token still covers this session */
  }
}

export function getAdminToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    const t = localStorage.getItem(KEY);
    if (t) memoryToken = t;
    return t;
  } catch {
    return null;
  }
}

export function clearAdminToken() {
  memoryToken = null;
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

/** Headers to attach to every admin API request (cookie-independent auth). */
export function getAdminHeaders(): Record<string, string> {
  const t = getAdminToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export class AuthError extends Error {
  constructor() {
    super("unauthorized");
    this.name = "AuthError";
  }
}

/**
 * fetch() wrapper for admin APIs. Sends the session token via BOTH channels —
 * Authorization header AND query param — so authentication survives privacy
 * tools that strip headers or block cookies/storage inside iframes.
 * Throws an AuthError on 401 so the UI can bounce back to the login screen.
 */
export async function adminFetch(input: string, init?: RequestInit): Promise<Response> {
  const token = getAdminToken();
  const url =
    token && !input.includes("token=")
      ? `${input}${input.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
      : input;
  const method = (init?.method ?? "GET").toUpperCase();
  const res = await fetch(url, {
    ...init,
    cache: method === "GET" ? "no-store" : init?.cache,
    headers: {
      ...((init?.headers as Record<string, string>) ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) {
    clearAdminToken();
    throw new AuthError();
  }
  return res;
}

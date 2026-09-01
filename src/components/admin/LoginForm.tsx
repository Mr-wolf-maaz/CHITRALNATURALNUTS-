"use client";

import { FormEvent, useState } from "react";
import { KeyRound, Loader2, Mountain, ShieldCheck } from "lucide-react";
import { AuthError, adminFetch, saveAdminToken } from "@/lib/admin-client";
import { APP_VERSION } from "@/lib/version";
import { readApiJson } from "@/lib/utils";

export default function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await readApiJson<{ token?: string }>(res);
      if (data.token) saveAdminToken(data.token);
      // Prove the session actually works in THIS browser before entering —
      // catches strict tracking-protection environments at login time
      // instead of failing silently inside the dashboard.
      try {
        await adminFetch("/api/admin/me");
      } catch (e) {
        if (e instanceof AuthError) {
          setError(
            "Signed in, but your browser blocked the session. If you are in an in-app browser (Facebook/WhatsApp preview etc.), open this page in a regular browser tab with cookies and site data allowed, then sign in again."
          );
          setBusy(false);
          return;
        }
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pine-950 via-pine-900 to-pine-800 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl">
            <Mountain className="h-7 w-7 text-pine-950" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-black text-white">Admin Panel</h1>
          <p className="mt-1 text-xs text-pine-300">Chitral Natural Nuts · Store Management</p>
        </div>

        <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-pine-800">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@chitralnuts.com"
            className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm outline-none transition focus:border-pine-500 focus:bg-white focus:ring-4 focus:ring-pine-500/10"
          />
          <label className="mb-1 mt-4 block text-xs font-extrabold uppercase tracking-wider text-pine-800">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm outline-none transition focus:border-pine-500 focus:bg-white focus:ring-4 focus:ring-pine-500/10"
          />

          {error && (
            <p className="animate-slide-up mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-pine-800 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-pine-700 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {busy ? "Signing in..." : "Sign In"}
          </button>

          <p className="mt-4 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-amber-700">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Demo credentials: admin@chitralnuts.com / admin123 — override with ADMIN_EMAIL &amp;
            ADMIN_PASSWORD env vars.
          </p>
        </form>
        <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-widest text-pine-300/70">
          build {APP_VERSION}
        </p>
      </div>
    </div>
  );
}

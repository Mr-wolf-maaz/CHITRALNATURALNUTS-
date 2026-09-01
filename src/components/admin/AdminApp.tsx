"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Loader2,
  LogOut,
  Mountain,
  Package,
  ShoppingBag,
  Store,
} from "lucide-react";
import LoginForm from "./LoginForm";
import Overview from "./Overview";
import ProductManager from "./ProductManager";
import OrderManager from "./OrderManager";
import Toasters from "@/components/Toasters";
import { clearAdminToken, getAdminHeaders } from "@/lib/admin-client";
import { APP_VERSION } from "@/lib/version";
import { cn } from "@/lib/utils";

type Tab = "overview" | "products" | "orders";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
];

function GateScreen({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-pine-950 via-pine-900 to-pine-800 px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl">
        <Mountain className="h-7 w-7 text-pine-950" />
      </span>
      <h1 className="mt-5 max-w-sm font-display text-2xl font-black text-white">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-pine-300">{sub}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3 text-xs font-extrabold uppercase tracking-wider text-pine-950 shadow-lg shadow-amber-500/25 transition hover:brightness-105"
      >
        Reload Now
      </button>
      <p className="mt-8 text-[10px] font-semibold uppercase tracking-widest text-pine-400">
        build {APP_VERSION}
      </p>
    </div>
  );
}

export default function AdminApp() {
  const [auth, setAuth] = useState<"loading" | "out" | "in">("loading");
  const [boot, setBoot] = useState<"loading" | "stale" | "down" | "ok">("loading");
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    (async () => {
      // 1) Detect stale bundles / dead runtimes BEFORE any session logic —
      //    this is what previously caused silent 401s everywhere.
      try {
        const hr = await fetch("/api/health", { cache: "no-store" });
        let hd: { ok?: boolean; version?: string } | null = null;
        try {
          hd = await hr.json();
        } catch {
          hd = null;
        }
        if (!hr.ok || !hd?.ok) {
          setBoot("down");
          return;
        }
        if (hd.version && hd.version !== APP_VERSION) {
          setBoot("stale");
          return;
        }
      } catch {
        setBoot("down");
        return;
      }
      setBoot("ok");

      // 2) Session check — me never 401s; it answers true/false.
      try {
        const res = await fetch("/api/admin/me", {
          headers: getAdminHeaders(),
          cache: "no-store",
        });
        const d = await res.json();
        if (d?.authenticated === true) setAuth("in");
        else {
          clearAdminToken();
          setAuth("out");
        }
      } catch {
        setAuth("out");
      }
    })();
  }, []);

  if (boot === "stale") {
    return (
      <GateScreen
        title="A newer version of the admin panel is available"
        sub="Your browser is still running old code, which causes data loading to fail. One reload fixes it."
      />
    );
  }
  if (boot === "down") {
    return (
      <GateScreen
        title="Can't reach the store server"
        sub="The app is restarting or waking up. Wait about 10 seconds, then reload."
      />
    );
  }
  if (auth === "loading" || boot === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pine-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }
  if (auth === "out") {
    return (
      <>
        <LoginForm onSuccess={() => setAuth("in")} />
        <Toasters />
      </>
    );
  }

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST", headers: getAdminHeaders() }).catch(() => {});
    clearAdminToken();
    setAuth("out");
  };

  /** Called by child panels when any admin API answers 401. */
  const handleUnauthorized = () => {
    clearAdminToken();
    setAuth("out");
  };

  return (
    <div className="min-h-screen bg-[#f4f2ec]">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-pine-950 text-pine-200 md:flex">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600">
            <Mountain className="h-5 w-5 text-pine-950" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-black text-white">Chitral Admin</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-amber-400">
              Dry Fruits
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition",
                tab === t.id
                  ? "bg-pine-800 text-white shadow-inner"
                  : "text-pine-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <t.icon className={cn("h-4.5 w-4.5", tab === t.id && "text-amber-400")} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-pine-300 transition hover:bg-white/5 hover:text-white"
          >
            <Store className="h-4.5 w-4.5" /> View Storefront
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/10"
          >
            <LogOut className="h-4.5 w-4.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Topbar (mobile) */}
      <div className="sticky top-0 z-30 flex items-center gap-2 bg-pine-950 px-4 py-3 md:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
          <Mountain className="h-4 w-4 text-pine-950" />
        </span>
        <p className="font-display text-sm font-black text-white">Natural Nuts Admin</p>
        <div className="ml-auto flex gap-1">
          <Link href="/" className="rounded-lg p-2 text-pine-300 hover:bg-white/10" aria-label="Storefront">
            <Store className="h-4.5 w-4.5" />
          </Link>
          <button onClick={logout} className="rounded-lg p-2 text-red-300 hover:bg-white/10" aria-label="Sign out">
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-10 md:pt-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-black capitalize text-pine-950 sm:text-3xl">
              {tab === "overview" ? "Dashboard Overview" : tab === "products" ? "Product Management" : "Order Management"}
            </h1>
            <p className="mt-0.5 text-xs text-stone-500 sm:text-sm">
              {tab === "overview"
                ? "Revenue, orders and inventory health at a glance."
                : tab === "products"
                  ? "Add, edit and restock your dry fruit catalogue."
                  : "Track, fulfil and update customer orders."}
            </p>
          </div>
          {tab === "overview" && <Overview onGoProducts={() => setTab("products")} onUnauthorized={handleUnauthorized} />}
          {tab === "products" && <ProductManager onUnauthorized={handleUnauthorized} />}
          {tab === "orders" && <OrderManager onUnauthorized={handleUnauthorized} />}
        </div>
      </main>

      {/* Bottom tabs (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-stone-200 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1",
              tab === t.id ? "text-pine-700" : "text-stone-400"
            )}
          >
            <t.icon className="h-5 w-5" />
            <span className="text-[10px] font-bold">{t.label}</span>
          </button>
        ))}
      </nav>

      <Toasters />
    </div>
  );
}

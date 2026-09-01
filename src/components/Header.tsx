"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingCart, Truck } from "lucide-react";
import { cartCount, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

export default function Header({
  query,
  onQuery,
}: {
  query: string;
  onQuery: (q: string) => void;
}) {
  const items = useCart((s) => s.items);
  const setCartOpen = useUi((s) => s.setCartOpen);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(items) : 0;

  return (
    <header className="sticky top-0 z-40 shadow-lg shadow-pine-950/10">
      {/* Announcement micro-bar */}
      <div className="flex items-center justify-center gap-2 bg-pine-950 px-3 py-1.5 text-[11px] font-medium tracking-wide text-pine-100">
        <Truck className="h-3.5 w-3.5 text-amber-400" />
        <span>Free delivery on orders over Rs 5,000 · Cash on Delivery nationwide</span>
      </div>

      <div className="bg-gradient-to-r from-pine-900 via-pine-800 to-pine-700">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-5">
          {/* Brand */}
          <a href="#home" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-pine-950 shadow-md shadow-black/20">
              <img src="/logo-mark.svg" alt="Chitral Natural Nuts" className="h-full w-full" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-black tracking-tight text-white">
                Chitral
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400">
                Natural Nuts
              </span>
            </span>
          </a>

          {/* Search (desktop) */}
          <div className="relative hidden flex-1 md:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search fresh Chitrali nuts, apricots, chalghoza..."
              className="h-10 w-full rounded-full border-none bg-white pl-10 pr-4 text-sm text-stone-800 shadow-inner outline-none ring-amber-400/60 transition placeholder:text-stone-400 focus:ring-4"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-extrabold text-pine-950 shadow ring-2 ring-pine-800">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search (mobile) */}
        <div className="px-3 pb-2.5 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search fresh Chitrali nuts, apricots..."
              className="h-10 w-full rounded-full border-none bg-white pl-10 pr-4 text-sm text-stone-800 shadow-inner outline-none ring-amber-400/60 transition placeholder:text-stone-400 focus:ring-4"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

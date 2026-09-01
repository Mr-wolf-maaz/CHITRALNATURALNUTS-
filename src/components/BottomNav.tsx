"use client";

import { useEffect, useState } from "react";
import { Home, LayoutGrid, ShoppingCart } from "lucide-react";
import { cartCount, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const items = useCart((s) => s.items);
  const setCartOpen = useUi((s) => s.setCartOpen);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(items) : 0;

  const itemCls = "flex flex-col items-center gap-0.5 py-1 text-stone-400 transition";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-100 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_rgba(10,31,23,0.12)] backdrop-blur md:hidden">
      <div className="grid grid-cols-3">
        <a href="#home" className={cn(itemCls, "text-pine-700")}>
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-bold">Home</span>
        </a>
        <a href="#categories" className={itemCls}>
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] font-bold">Categories</span>
        </a>
        <button onClick={() => setCartOpen(true)} className={cn(itemCls, "relative")}>
          <span className="relative">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-extrabold text-pine-950">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </span>
          <span className="text-[10px] font-bold">Cart</span>
        </button>
      </div>
    </nav>
  );
}

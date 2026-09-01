"use client";

import { useEffect } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { cartSubtotal, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, formatRs } from "@/lib/utils";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, setCheckoutOpen } = useUi();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const subtotal = cartSubtotal(items);
  const shipping = items.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="animate-fade-in absolute inset-0 bg-pine-950/50 backdrop-blur-[2px]"
        onClick={() => setCartOpen(false)}
      />
      <aside className="animate-drawer-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#faf8f3] shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 bg-pine-800 px-5 py-4 text-white">
          <ShoppingBag className="h-5 w-5 text-amber-400" />
          <h2 className="font-display text-lg font-black">My Cart</h2>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
          <button
            onClick={() => setCartOpen(false)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div className="border-b border-stone-100 bg-white px-5 py-3">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-pine-800">
              <Truck className="h-4 w-4 text-amber-500" />
              {remaining > 0 ? (
                <span>
                  Add <span className="text-amber-600">{formatRs(remaining)}</span> more for FREE delivery
                </span>
              ) : (
                <span className="text-pine-700">You&apos;ve unlocked FREE delivery!</span>
              )}
            </p>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pine-500 to-amber-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-pine-50">
                <ShoppingBag className="h-9 w-9 text-pine-300" />
              </span>
              <p className="mt-4 font-display text-lg font-black text-pine-950">
                Your cart feels light
              </p>
              <p className="mt-1 max-w-[220px] text-xs text-stone-500">
                Add some premium Chitrali nuts & dried fruits to get started.
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-5 rounded-full bg-pine-800 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-pine-700"
              >
                Shop Now
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((i) => (
                <li
                  key={i.key}
                  className="animate-slide-up flex gap-3 rounded-2xl border border-stone-100 bg-white p-3 shadow-sm"
                >
                  <img
                    src={i.imageUrl}
                    alt={i.title}
                    className="h-18 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-stone-800">{i.title}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="rounded-md bg-pine-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-pine-700">
                        {i.weight}
                      </span>
                      <span className="text-[10px] font-medium text-stone-400">
                        {formatRs(i.unitPrice)} each
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-stone-200">
                        <button
                          onClick={() => setQty(i.key, i.qty - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-l-lg text-stone-500 transition hover:bg-stone-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-extrabold tabular-nums">
                          {i.qty}
                        </span>
                        <button
                          onClick={() => setQty(i.key, i.qty + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-r-lg text-stone-500 transition hover:bg-stone-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-extrabold text-amber-600">
                        {formatRs(i.unitPrice * i.qty)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(i.key)}
                    className="self-start text-stone-300 transition hover:text-red-500"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span className="font-bold text-stone-800">{formatRs(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Shipping</span>
                <span className="font-bold text-stone-800">
                  {shipping === 0 ? <span className="text-pine-600">FREE</span> : formatRs(shipping)}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-stone-200 pt-2 text-base font-extrabold text-pine-950">
                <span>Total</span>
                <span>{formatRs(subtotal + shipping)}</span>
              </div>
            </div>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-extrabold uppercase tracking-wider text-pine-950 shadow-lg shadow-amber-500/25 transition hover:brightness-105 active:scale-[0.99]"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

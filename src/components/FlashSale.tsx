"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ShoppingCart, Zap } from "lucide-react";
import {
  ProductDTO,
  cn,
  discountPercent,
  formatRs,
  priceForWeight,
  soldPercent,
} from "@/lib/utils";

function useCountdown() {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const diff = Math.max(0, end.getTime() - now.getTime());
      setLeft({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return left;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function FlashSale({
  products,
  onAdd,
}: {
  products: ProductDTO[];
  onAdd: (p: ProductDTO, weight: string) => void;
}) {
  const { h, m, s } = useCountdown();
  const [weights, setWeights] = useState<Record<string, string>>({});
  const deals = products.filter((p) => p.salePrice !== null && discountPercent(p) > 0);
  if (deals.length === 0) return null;

  return (
    <section id="flash" className="mx-auto max-w-7xl scroll-mt-24 px-3 pt-6 sm:px-5">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-pine-900 via-pine-800 to-pine-950 shadow-xl shadow-pine-950/15">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 sm:px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md">
            <Zap className="h-5 w-5 fill-pine-950 text-pine-950" />
          </span>
          <div className="leading-tight">
            <h2 className="font-display text-lg font-black text-white sm:text-xl">Flash Sale</h2>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">
              Hot deals · tonight only
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="mr-1 hidden text-[10px] font-bold uppercase tracking-widest text-pine-200 sm:block">
              Ends in
            </span>
            {[pad(h), pad(m), pad(s)].map((v, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 font-mono text-sm font-extrabold text-amber-300 tabular-nums ring-1 ring-white/10">
                  {v}
                </span>
                {i < 2 && <span className="font-black text-amber-400">:</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="no-scrollbar -mx-0 flex snap-x gap-3 overflow-x-auto px-4 py-4 sm:px-6">
          {deals.map((p) => {
            const off = discountPercent(p);
            const weight = weights[p.id] ?? p.weightOptions[0] ?? "1kg";
            const price = priceForWeight(p.salePrice ?? p.originalPrice, weight);
            const was = priceForWeight(p.originalPrice, weight);
            const sold = soldPercent(p.id, p.stock);
            const out = p.stock <= 0;
            return (
              <div
                key={p.id}
                className="w-[172px] shrink-0 snap-start overflow-hidden rounded-xl bg-white shadow-lg sm:w-[188px]"
              >
                <Link href={`/product/${p.id}`} className="relative block h-28 overflow-hidden sm:h-32">
                  <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-extrabold text-pine-950 shadow">
                    -{off}%
                  </span>
                  {out && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-extrabold uppercase tracking-widest text-white">
                      Sold out
                    </span>
                  )}
                </Link>
                <div className="p-2.5">
                  <Link href={`/product/${p.id}`} className="block">
                    <p className="truncate text-xs font-bold text-stone-800 transition hover:text-pine-700">{p.title}</p>
                  </Link>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold text-amber-600">{formatRs(price)}</span>
                    <span className="text-[10px] font-medium text-stone-400 line-through">
                      {formatRs(was)}
                    </span>
                  </div>
                  {/* sold bar */}
                  <div className="mt-1.5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                        style={{ width: `${sold}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-[9px] font-semibold text-stone-400">{sold}% sold</p>
                  </div>
                  <div className="mt-1.5 flex gap-1">
                    {p.weightOptions.map((w) => (
                      <button
                        key={w}
                        onClick={() => setWeights((s) => ({ ...s, [p.id]: w }))}
                        className={cn(
                          "rounded-md border px-1.5 py-0.5 text-[9px] font-bold transition",
                          weight === w
                            ? "border-pine-700 bg-pine-800 text-white"
                            : "border-stone-200 text-stone-500 hover:border-pine-400"
                        )}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={out}
                    onClick={() => onAdd(p, weight)}
                    className={cn(
                      "mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-extrabold uppercase tracking-wide transition",
                      out
                        ? "cursor-not-allowed bg-stone-100 text-stone-400"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 text-pine-950 shadow-sm hover:brightness-105 active:scale-[0.98]"
                    )}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
          <a
            href="#feed"
            className="flex w-[80px] shrink-0 snap-start flex-col items-center justify-center gap-1 text-pine-200 transition hover:text-amber-400"
          >
            <ChevronRight className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">View all</span>
          </a>
        </div>
      </div>
    </section>
  );
}

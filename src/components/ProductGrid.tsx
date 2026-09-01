"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Plus, Sparkles } from "lucide-react";
import {
  ProductDTO,
  cn,
  discountPercent,
  formatRs,
  priceForWeight,
} from "@/lib/utils";

export function ProductCard({
  product: p,
  onAdd,
}: {
  product: ProductDTO;
  onAdd: (p: ProductDTO, weight: string) => void;
}) {
  const [weight, setWeight] = useState(p.weightOptions[0] ?? "1kg");
  const off = discountPercent(p);
  const price = priceForWeight(p.salePrice ?? p.originalPrice, weight);
  const was = priceForWeight(p.originalPrice, weight);
  const out = p.stock <= 0;
  const low = !out && p.stock < 5;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pine-950/10">
      <Link href={`/product/${p.id}`} className="relative block h-36 overflow-hidden bg-sand-100 sm:h-44">
        <img
          src={p.imageUrl}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {off > 0 && (
          <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-extrabold text-pine-950 shadow">
            <Flame className="h-3 w-3" />-{off}%
          </span>
        )}
        {p.isFeatured && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-pine-800/90 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-300 backdrop-blur">
            <Sparkles className="h-3 w-3" /> Featured
          </span>
        )}
        {out && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/60 text-xs font-extrabold uppercase tracking-widest text-stone-500 backdrop-blur-[1px]">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-pine-600">
          {p.category}
        </p>
        <Link href={`/product/${p.id}`} className="mt-0.5 block">
          <h3 className="line-clamp-2 min-h-8 text-[13px] font-bold leading-snug text-stone-800 transition hover:text-pine-700 sm:text-sm">
            {p.title}
          </h3>
        </Link>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-base font-extrabold text-amber-600 sm:text-lg">
            {formatRs(price)}
          </span>
          {off > 0 && (
            <span className="text-[11px] font-medium text-stone-400 line-through">
              {formatRs(was)}
            </span>
          )}
          <span className="text-[10px] font-semibold text-stone-400">/ {weight}</span>
        </div>

        {/* Weight selector */}
        <div className="mt-2 flex flex-wrap gap-1">
          {p.weightOptions.map((w) => (
            <button
              key={w}
              onClick={() => setWeight(w)}
              className={cn(
                "rounded-lg border px-2 py-1 text-[10px] font-bold transition",
                weight === w
                  ? "border-pine-700 bg-pine-800 text-white shadow-sm"
                  : "border-stone-200 bg-white text-stone-500 hover:border-pine-400 hover:text-pine-700"
              )}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Stock status */}
        <p
          className={cn(
            "mt-2 flex items-center gap-1.5 text-[10px] font-bold",
            out ? "text-stone-400" : low ? "text-amber-600" : "text-pine-600"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              out ? "bg-stone-300" : low ? "bg-amber-500" : "bg-pine-500"
            )}
          />
          {out ? "Out of stock" : low ? `Only ${p.stock} left` : "In stock"}
        </p>

        <button
          disabled={out}
          onClick={() => onAdd(p, weight)}
          className={cn(
            "mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold uppercase tracking-wide transition active:scale-[0.98]",
            out
              ? "cursor-not-allowed bg-stone-100 text-stone-400"
              : "bg-pine-800 text-white shadow-sm hover:bg-pine-700"
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={3} /> Add
        </button>
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
      <div className="h-36 animate-pulse bg-stone-200 sm:h-44" />
      <div className="space-y-2 p-3">
        <div className="h-2 w-1/3 animate-pulse rounded bg-stone-200" />
        <div className="h-3 w-full animate-pulse rounded bg-stone-200" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-stone-200" />
        <div className="flex gap-1 pt-1">
          <div className="h-6 w-10 animate-pulse rounded-lg bg-stone-200" />
          <div className="h-6 w-10 animate-pulse rounded-lg bg-stone-200" />
          <div className="h-6 w-10 animate-pulse rounded-lg bg-stone-200" />
        </div>
        <div className="h-8 w-full animate-pulse rounded-xl bg-stone-200" />
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  loading,
  onAdd,
}: {
  products: ProductDTO[];
  loading: boolean;
  onAdd: (p: ProductDTO, weight: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {loading
        ? Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)
        : products.map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
    </div>
  );
}

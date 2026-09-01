"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Banknote,
  ChevronRight,
  Flame,
  Leaf,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  User,
  Zap,
} from "lucide-react";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import Toasters from "@/components/Toasters";
import { ProductCard } from "@/components/ProductGrid";
import { cartCount, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import {
  ProductDTO,
  cn,
  discountPercent,
  effectiveKgPrice,
  formatRs,
  priceForWeight,
  readApiJson,
} from "@/lib/utils";

type ReviewDTO = { id: string; name: string; rating: number; comment: string; createdAt: string };

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            size,
            i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"
          )}
        />
      ))}
    </span>
  );
}

function SlimHeader() {
  const items = useCart((s) => s.items);
  const setCartOpen = useUi((s) => s.setCartOpen);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(items) : 0;

  return (
    <header className="sticky top-0 z-40 shadow-lg shadow-pine-950/10">
      <div className="flex items-center justify-center gap-2 bg-pine-950 px-3 py-1.5 text-[11px] font-medium tracking-wide text-pine-100">
        <Truck className="h-3.5 w-3.5 text-amber-400" />
        <span>Free delivery on orders over Rs 5,000 · COD nationwide</span>
      </div>
      <div className="bg-gradient-to-r from-pine-900 via-pine-800 to-pine-700">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2.5 sm:px-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-pine-950 shadow-md">
              <img src="/logo-mark.svg" alt="Chitral Natural Nuts" className="h-full w-full" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-black tracking-tight text-white">Chitral</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400">Natural Nuts</span>
            </span>
          </Link>
          <Link
            href="/"
            className="ml-2 hidden rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-white/20 sm:block"
          >
            ← Continue Shopping
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <a
              href="#reviews"
              className="hidden items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-white/20 sm:flex"
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Reviews
            </a>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-extrabold text-pine-950 ring-2 ring-pine-800">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function ProductView({
  product: p,
  reviews,
  ratingAvg,
  ratingCount,
  related,
}: {
  product: ProductDTO;
  reviews: ReviewDTO[];
  ratingAvg: number;
  ratingCount: number;
  related: ProductDTO[];
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const { toast, setCartOpen } = useUi();

  const [weight, setWeight] = useState(p.weightOptions[0] ?? "1kg");
  const [qty, setQty] = useState(1);
  const off = discountPercent(p);
  const price = priceForWeight(effectiveKgPrice(p), weight);
  const was = priceForWeight(p.originalPrice, weight);
  const out = p.stock <= 0;
  const low = !out && p.stock < 5;

  const doAdd = (quantity: number) =>
    add(
      {
        productId: p.id,
        title: p.title,
        imageUrl: p.imageUrl,
        weight,
        unitPrice: price,
      },
      quantity
    );

  const addToCart = () => {
    doAdd(qty);
    toast(`Added · ${p.title} (${weight})`);
  };
  const buyNow = () => {
    doAdd(qty);
    setCartOpen(true);
  };
  const onRelatedAdd = (rp: ProductDTO, w: string) => {
    add({
      productId: rp.id,
      title: rp.title,
      imageUrl: rp.imageUrl,
      weight: w,
      unitPrice: priceForWeight(effectiveKgPrice(rp), w),
    });
    toast(`Added · ${rp.title} (${w})`);
  };

  /* ---------- review form ---------- */
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  async function submitReview(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${p.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment }),
      });
      await readApiJson(res);
      setName("");
      setComment("");
      setRating(5);
      toast("Shukriya! Your review is live.");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not submit review.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const dist = useMemo(() => {
    const d = [0, 0, 0, 0, 0];
    for (const r of reviews) d[Math.max(0, Math.min(4, r.rating - 1))]++;
    return d.reverse();
  }, [reviews]);

  return (
    <div className="min-h-screen pb-28 md:pb-0">
      <SlimHeader />

      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-400">
          <Link href="/" className="transition hover:text-pine-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/?category=${encodeURIComponent(p.category)}`} className="transition hover:text-pine-700">
            {p.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="max-w-[160px] truncate text-pine-800 sm:max-w-none">{p.title}</span>
        </nav>

        {/* Product */}
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {/* Image */}
          <div className="relative overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-sm">
            <img src={p.imageUrl} alt={p.title} className="aspect-square h-full w-full object-cover" />
            {off > 0 && (
              <span className="absolute left-4 top-4 flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-extrabold text-pine-950 shadow-lg">
                <Flame className="h-4 w-4" /> {off}% OFF
              </span>
            )}
            {p.isFeatured && (
              <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg bg-pine-800/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-300 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Featured
              </span>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="rounded-full bg-pine-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-pine-700">
              {p.category}
            </span>
            <h1 className="mt-3 font-display text-2xl font-black leading-tight text-pine-950 sm:text-4xl">
              {p.title}
            </h1>

            <a href="#reviews" className="mt-2.5 flex w-fit items-center gap-2">
              <Stars value={ratingAvg} />
              <span className="text-sm font-extrabold text-stone-700">
                {ratingCount > 0 ? ratingAvg.toFixed(1) : "New"}
              </span>
              <span className="text-xs font-semibold text-stone-400">
                ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
              </span>
            </a>

            <div className="mt-4 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white p-4">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-display text-3xl font-black text-amber-600 sm:text-4xl">
                  {formatRs(price)}
                </span>
                {off > 0 && (
                  <span className="text-base font-semibold text-stone-400 line-through">{formatRs(was)}</span>
                )}
                <span className="text-xs font-bold text-stone-400">/ {weight}</span>
              </div>

              {/* Weight */}
              <p className="mt-3 text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
                Select Weight
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {p.weightOptions.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeight(w)}
                    className={cn(
                      "rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition",
                      weight === w
                        ? "border-pine-700 bg-pine-800 text-white shadow"
                        : "border-stone-200 bg-white text-stone-500 hover:border-pine-400"
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>

              {/* Qty + stock */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center rounded-xl border border-stone-200 bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-l-xl text-stone-500 transition hover:bg-stone-50"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-extrabold tabular-nums">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(20, q + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-r-xl text-stone-500 transition hover:bg-stone-50"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-extrabold",
                    out ? "text-stone-400" : low ? "text-amber-600" : "text-pine-600"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", out ? "bg-stone-300" : low ? "bg-amber-500" : "bg-pine-500")} />
                  {out ? "Out of stock" : low ? `Only ${p.stock} left — order soon` : "In stock, ready to ship"}
                </p>
              </div>

              {/* CTAs */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  disabled={out}
                  onClick={addToCart}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold uppercase tracking-wide transition active:scale-[0.99]",
                    out
                      ? "cursor-not-allowed bg-stone-100 text-stone-400"
                      : "bg-pine-800 text-white shadow hover:bg-pine-700"
                  )}
                >
                  <ShoppingCart className="h-4.5 w-4.5" /> Add to Cart
                </button>
                <button
                  disabled={out}
                  onClick={buyNow}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold uppercase tracking-wide transition active:scale-[0.99]",
                    out
                      ? "cursor-not-allowed bg-stone-100 text-stone-400"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 text-pine-950 shadow-lg shadow-amber-500/25 hover:brightness-105"
                  )}
                >
                  <Zap className="h-4.5 w-4.5" /> Buy Now
                </button>
              </div>
            </div>

            {/* Trust rows */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              {[
                { icon: Banknote, label: "Cash on Delivery", sub: "or Easypaisa / JazzCash" },
                { icon: Truck, label: "2–4 Day Delivery", sub: "across Pakistan" },
                { icon: Leaf, label: "100% Organic", sub: "sun-dried, no additives" },
                { icon: ShieldCheck, label: "Freshness Promise", sub: "refund if not fresh" },
              ].map((t) => (
                <div key={t.label} className="flex items-center gap-2.5 rounded-xl border border-stone-100 bg-white p-3">
                  <t.icon className="h-5 w-5 shrink-0 text-pine-700" />
                  <div>
                    <p className="font-extrabold text-stone-800">{t.label}</p>
                    <p className="text-[10px] text-stone-400">{t.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="mt-8 rounded-3xl border border-stone-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-xl font-black text-pine-950">
            <BadgeCheck className="h-5 w-5 text-pine-600" /> About this product
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
            {p.description}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { k: "Origin", v: "Chitral Valley, Hindu Kush (~6,000 ft)" },
              { k: "Processing", v: "Sun-dried, hand-sorted, zero additives" },
              { k: "Packed On", v: "Fresh batch — sealed after your order" },
            ].map((f) => (
              <div key={f.k} className="rounded-2xl bg-stone-50 p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">{f.k}</p>
                <p className="mt-1 text-xs font-bold text-stone-700">{f.v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews" className="mt-8 scroll-mt-28 rounded-3xl border border-stone-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-xl font-black text-pine-950">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> Ratings & Reviews
          </h2>

          <div className="mt-5 grid gap-6 md:grid-cols-[240px_1fr]">
            {/* Summary */}
            <div className="rounded-2xl bg-stone-50 p-5 text-center">
              <p className="font-display text-5xl font-black text-pine-950">
                {ratingCount > 0 ? ratingAvg.toFixed(1) : "—"}
              </p>
              <div className="mt-2 flex justify-center">
                <Stars value={ratingAvg} size="h-5 w-5" />
              </div>
              <p className="mt-1.5 text-xs font-bold text-stone-400">
                {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
              </p>
              <div className="mt-4 space-y-1.5">
                {dist.map((n, i) => {
                  const star = 5 - i;
                  const pct = reviews.length ? Math.round((n / reviews.length) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-[10px] font-bold text-stone-400">
                      <span className="w-3">{star}★</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right">{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List + form */}
            <div>
              {reviews.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-stone-200 p-6 text-center text-sm text-stone-400">
                  No reviews yet — be the first to share your experience!
                </p>
              ) : (
                <ul className="space-y-3">
                  {reviews.map((r) => (
                    <li key={r.id} className="rounded-2xl border border-stone-100 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pine-800 text-xs font-extrabold text-amber-400">
                          {r.name.trim().charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold text-stone-800">{r.name}</p>
                          <div className="flex items-center gap-2">
                            <Stars value={r.rating} size="h-3 w-3" />
                            <span className="text-[10px] font-semibold text-stone-400">
                              {new Date(r.createdAt).toLocaleDateString("en-PK", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-pine-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-pine-700">
                          <BadgeCheck className="h-3 w-3" /> Verified
                        </span>
                      </div>
                      <p className="mt-2.5 text-sm leading-relaxed text-stone-600">{r.comment}</p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Write review */}
              <form onSubmit={submitReview} className="mt-5 rounded-2xl bg-stone-50 p-5">
                <p className="flex items-center gap-2 text-sm font-extrabold text-pine-950">
                  <User className="h-4 w-4 text-pine-600" /> Write a review
                </p>
                <div className="mt-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setRating(i)}
                      aria-label={`${i} star${i > 1 ? "s" : ""}`}
                      className="p-0.5 transition hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7",
                          i <= rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-stone-500">
                    {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[200px_1fr]">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-11 rounded-xl border border-stone-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10"
                  />
                  <input
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was the freshness, taste, packing?"
                    className="h-11 rounded-xl border border-stone-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-pine-800 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-pine-700 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 font-display text-2xl font-black text-pine-950">You may also like</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {related.map((rp) => (
                <ProductCard key={rp.id} product={rp} onAdd={onRelatedAdd} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-stone-100 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(10,31,23,0.12)] backdrop-blur md:hidden">
        <div className="leading-tight">
          <p className="text-base font-extrabold text-amber-600">{formatRs(price * qty)}</p>
          <p className="text-[10px] font-bold text-stone-400">
            {weight} × {qty}
          </p>
        </div>
        <button
          disabled={out}
          onClick={addToCart}
          className={cn(
            "flex-1 rounded-xl py-3 text-xs font-extrabold uppercase tracking-wide",
            out ? "bg-stone-100 text-stone-400" : "bg-pine-800 text-white"
          )}
        >
          Add to Cart
        </button>
        <button
          disabled={out}
          onClick={buyNow}
          className={cn(
            "flex-1 rounded-xl py-3 text-xs font-extrabold uppercase tracking-wide",
            out ? "bg-stone-100 text-stone-400" : "bg-gradient-to-r from-amber-500 to-amber-600 text-pine-950"
          )}
        >
          Buy Now
        </button>
      </div>

      <CartDrawer />
      <CheckoutModal />
      <Toasters />
    </div>
  );
}

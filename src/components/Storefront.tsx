"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, Leaf, Mountain, SearchX, ShieldCheck, Truck } from "lucide-react";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import CategoryRow from "@/components/CategoryRow";
import FlashSale from "@/components/FlashSale";
import ProductGrid from "@/components/ProductGrid";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import BottomNav from "@/components/BottomNav";
import Toasters from "@/components/Toasters";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { ProductDTO, effectiveKgPrice, priceForWeight, readApiJson } from "@/lib/utils";

export default function Storefront() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const add = useCart((s) => s.add);
  const toast = useUi((s) => s.toast);
  const searchParams = useSearchParams();

  // Deep link support: /?category=Walnuts
  useEffect(() => {
    const c = searchParams.get("category");
    if (c) setCategory(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/products")
      .then((r) => readApiJson<{ products?: ProductDTO[] }>(r))
      .then((d) => alive && setProducts(d.products ?? []))
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const onAdd = useCallback(
    (p: ProductDTO, weight: string) => {
      add({
        productId: p.id,
        title: p.title,
        imageUrl: p.imageUrl,
        weight,
        unitPrice: priceForWeight(effectiveKgPrice(p), weight),
      });
      toast(`Added · ${p.title} (${weight})`);
    },
    [add, toast]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [products, query, category]);

  const searching = query.trim().length > 0;

  return (
    <div id="top" className="min-h-screen pb-20 md:pb-0">
      <Header query={query} onQuery={setQuery} />

      <main className="space-y-1">
        {!searching && (
          <>
            <HeroSlider />
            <CategoryRow active={category} onSelect={setCategory} />
            <FlashSale products={products} onAdd={onAdd} />
          </>
        )}

        {/* Product feed */}
        <section id="feed" className="mx-auto max-w-7xl scroll-mt-24 px-3 pb-10 pt-6 sm:px-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-600">
                {searching ? `Results for “${query.trim()}”` : "Curated for you"}
              </p>
              <h2 className="font-display text-2xl font-black text-pine-950 sm:text-3xl">
                {searching ? "Search Results" : category ? category : "Just For You"}
              </h2>
            </div>
            {!loading && (
              <span className="rounded-full bg-pine-50 px-3 py-1 text-[11px] font-bold text-pine-700">
                {filtered.length} {filtered.length === 1 ? "product" : "products"}
              </span>
            )}
          </div>

          {!loading && filtered.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-200 bg-white/60 py-16 text-center">
              <SearchX className="h-10 w-10 text-stone-300" />
              <p className="mt-3 font-display text-lg font-black text-stone-700">Nothing found</p>
              <p className="mt-1 max-w-xs text-xs text-stone-400">
                Try searching for walnuts, almonds, chalghoza, apricots, mulberries or figs.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setCategory(null);
                }}
                className="mt-4 rounded-full bg-pine-800 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-white"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <ProductGrid products={filtered} loading={loading} onAdd={onAdd} />
          )}
        </section>

        {/* Trust strip */}
        {!searching && (
          <section className="mx-auto max-w-7xl px-3 pb-12 sm:px-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { icon: Leaf, title: "100% Organic", sub: "Sun-dried, zero additives" },
                { icon: Mountain, title: "Chitral Sourced", sub: "Direct from Hindu Kush farms" },
                { icon: Truck, title: "Fast Delivery", sub: "2–4 days across Pakistan" },
                { icon: BadgeCheck, title: "Quality Promise", sub: "Full refund if not fresh" },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pine-50">
                    <f.icon className="h-5 w-5 text-pine-700" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-stone-800 sm:text-sm">{f.title}</p>
                    <p className="text-[10px] text-stone-400 sm:text-[11px]">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-pine-950 text-pine-200">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                <Mountain className="h-4.5 w-4.5 text-pine-950" />
              </span>
              <span className="font-display text-lg font-black text-white">Chitral Natural Nuts</span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-pine-300">
              Premium organic dry fruits from the valleys of Chitral — walnuts, almonds, chalghoza,
              apricots, mulberries & figs, delivered fresh across Pakistan.
            </p>
          </div>
          <div className="text-xs">
            <p className="mb-3 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
              <ShieldCheck className="h-3.5 w-3.5" /> We promise
            </p>
            <ul className="space-y-2 text-pine-300">
              <li>Cash on Delivery nationwide</li>
              <li>Easypaisa / JazzCash accepted</li>
              <li>Freshness guaranteed or refunded</li>
            </ul>
          </div>
          <div className="text-xs">
            <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
              Contact
            </p>
            <ul className="space-y-2 text-pine-300">
              <li>
                <a
                  href="https://wa.me/923408895642"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-amber-400"
                >
                  WhatsApp: +92 340 8895642
                </a>
              </li>
              <li>Bazaar Road, Chitral, KPK</li>
              <li>Open daily · 9am – 9pm</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-[11px] text-pine-400">
          © {new Date().getFullYear()} Chitral Natural Nuts · Grown at 6,000 ft, loved everywhere.
        </div>
      </footer>

      <CartDrawer />
      <CheckoutModal />
      <BottomNav />
      <Toasters />
    </div>
  );
}

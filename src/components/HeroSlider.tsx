"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgePercent, ChevronLeft, ChevronRight, Leaf, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = {
  kicker: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
  badge: string;
  image?: string;
  gradient?: string;
};

const SLIDES: Slide[] = [
  {
    kicker: "Harvest 2025 · Chitral Valley",
    title: "Pure. Organic. Unforgettable.",
    sub: "Hand-picked walnuts, almonds & chalghoza from the Hindu Kush — sun-dried, never processed.",
    cta: "Shop Flash Sale",
    href: "#flash",
    badge: "Up to 25% OFF",
    image: "https://images.unsplash.com/photo-1599599810694-b5ac4dd84e13?w=1200&h=400&fit=crop",
  },
  {
    kicker: "From the Roof of Pakistan",
    title: "Mountain-Grown Goodness",
    sub: "Sourced directly from Chitrali farmers at 6,000 ft. Fresh batches every week.",
    cta: "Browse Collection",
    href: "#feed",
    badge: "COD Nationwide",
    image: "https://images.unsplash.com/photo-1585518419759-78b70fe6e619?w=1200&h=400&fit=crop",
  },
  {
    kicker: "This Week Only",
    title: "Free Delivery Over Rs 5,000",
    sub: "Stock up the winter pantry — premium nuts & dried fruits shipped fresh to your doorstep.",
    cta: "Start Shopping",
    href: "#feed",
    badge: "Free Shipping",
    gradient: "from-pine-950 via-pine-800 to-pine-600",
  },
];

export default function HeroSlider() {
  const [idx, setIdx] = useState(0);
  const next = useCallback(() => setIdx((i) => (i + 1) % SLIDES.length), []);
  const prev = () => setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section id="home" className="mx-auto max-w-7xl px-3 pt-3 sm:px-5">
      <div className="group relative h-[210px] overflow-hidden rounded-2xl shadow-xl shadow-pine-950/10 sm:h-[260px] md:h-[330px]">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === idx ? "z-10 opacity-100" : "z-0 opacity-0"
            )}
          >
            {s.image ? (
              <img src={s.image} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className={cn("h-full w-full bg-gradient-to-br", s.gradient)}>
                <Leaf className="absolute -right-8 -top-8 h-56 w-56 text-white/5" />
                <Leaf className="absolute bottom-4 right-24 h-24 w-24 rotate-45 text-white/5" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-pine-950/85 via-pine-950/45 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-10 md:px-14">
              <span className="mb-2 flex w-fit items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-pine-950 shadow-lg sm:text-[11px]">
                <BadgePercent className="h-3.5 w-3.5" />
                {s.badge}
              </span>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300 sm:text-xs">
                {s.kicker}
              </p>
              <h2 className="max-w-md font-display text-2xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
                {s.title}
              </h2>
              <p className="mt-2 hidden max-w-sm text-sm text-pine-100/90 sm:block md:text-base">
                {s.sub}
              </p>
              <a
                href={s.href}
                className="mt-4 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-pine-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              >
                <Truck className="h-4 w-4" />
                {s.cta}
              </a>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-2.5 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 group-hover:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-2.5 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 group-hover:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === idx ? "w-6 bg-amber-400" : "w-1.5 bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

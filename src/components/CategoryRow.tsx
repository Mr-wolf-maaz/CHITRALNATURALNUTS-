"use client";

import { LayoutGrid } from "lucide-react";
import { CATEGORIES, cn } from "@/lib/utils";

export default function CategoryRow({
  active,
  onSelect,
}: {
  active: string | null;
  onSelect: (c: string | null) => void;
}) {
  return (
    <section id="categories" className="mx-auto max-w-7xl scroll-mt-24 px-3 pt-5 sm:px-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl font-black text-pine-950 sm:text-2xl">Categories</h2>
          <p className="text-xs text-stone-500">Straight from Chitral&apos;s orchards</p>
        </div>
        {active && (
          <button
            onClick={() => onSelect(null)}
            className="text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-1 sm:-mx-5 sm:gap-4 sm:px-5">
        <button
          onClick={() => onSelect(null)}
          className="group flex w-[72px] shrink-0 snap-start flex-col items-center gap-1.5"
        >
          <span
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white shadow-sm transition group-hover:shadow-md sm:h-[72px] sm:w-[72px]",
              active === null ? "border-amber-500 ring-4 ring-amber-500/20" : "border-pine-100"
            )}
          >
            <LayoutGrid className={cn("h-6 w-6", active === null ? "text-amber-600" : "text-pine-700")} />
          </span>
          <span className="text-center text-[11px] font-bold leading-tight text-pine-950">All</span>
          <span className="-mt-1 text-[9px] font-medium uppercase tracking-wider text-stone-400">Everything</span>
        </button>

        {CATEGORIES.map((c) => {
          const isActive = active === c.name;
          return (
            <button
              key={c.name}
              onClick={() => {
                onSelect(isActive ? null : c.name);
                document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group flex w-[72px] shrink-0 snap-start flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "block h-16 w-16 overflow-hidden rounded-full border-2 bg-white shadow-sm transition group-hover:scale-[1.03] group-hover:shadow-md sm:h-[72px] sm:w-[72px]",
                  isActive ? "border-amber-500 ring-4 ring-amber-500/20" : "border-pine-100"
                )}
              >
                <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
              </span>
              <span className="text-center text-[11px] font-bold leading-tight text-pine-950">
                {c.name.replace("Dried ", "")}
              </span>
              <span className="-mt-1 text-[9px] font-medium uppercase tracking-wider text-stone-400">
                {c.urdu}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

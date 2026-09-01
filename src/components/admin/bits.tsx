"use client";

import { cn } from "@/lib/utils";

export const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 ring-amber-300",
  Processing: "bg-blue-100 text-blue-700 ring-blue-300",
  Shipped: "bg-violet-100 text-violet-700 ring-violet-300",
  Delivered: "bg-pine-100 text-pine-700 ring-pine-300",
  Cancelled: "bg-red-100 text-red-600 ring-red-300",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1",
        STATUS_STYLES[status] ?? "bg-stone-100 text-stone-600 ring-stone-300",
        className
      )}
    >
      {status}
    </span>
  );
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short" }) +
    ", " +
    d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "pine",
}: {
  icon: typeof import("lucide-react").Coins;
  label: string;
  value: string;
  sub: string;
  tone?: "pine" | "amber" | "red" | "blue";
}) {
  const tones: Record<string, string> = {
    pine: "from-pine-700 to-pine-900",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
    blue: "from-blue-500 to-blue-600",
  };
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-stone-400">
          {label}
        </p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow",
            tones[tone]
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-black text-pine-950 sm:text-3xl">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-stone-400">{sub}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-8 flex-1 animate-pulse rounded-lg bg-stone-100" />
          ))}
        </div>
      ))}
    </div>
  );
}

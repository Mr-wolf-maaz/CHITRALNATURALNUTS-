"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  Coins,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { ProductDTO, cn, formatRs, shortId } from "@/lib/utils";
import { AuthError, adminFetch } from "@/lib/admin-client";
import { StatusBadge, StatCard, TableSkeleton, formatDate } from "./bits";

type Stats = {
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStock: ProductDTO[];
  recentOrders: {
    id: string;
    customerName: string;
    city: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
};

export default function Overview({
  onGoProducts,
  onUnauthorized,
}: {
  onGoProducts: () => void;
  onUnauthorized: () => void;
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const r = await adminFetch("/api/admin/stats");
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json();
      // Guard against malformed payloads so the dashboard can never crash.
      if (!d || !Array.isArray(d.lowStock) || !Array.isArray(d.recentOrders)) {
        throw new Error("bad payload");
      }
      setStats(d as Stats);
    } catch (e) {
      if (e instanceof AuthError) {
        onUnauthorized();
        return;
      }
      setFailed(true);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  if (failed) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-200 bg-white py-14 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="mt-3 text-sm font-extrabold text-stone-700">Couldn&apos;t load dashboard data</p>
        <p className="mt-1 text-xs text-stone-400">The database may be waking up — try again.</p>
        <button
          onClick={load}
          className="mt-4 rounded-full bg-pine-800 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-pine-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
        <div className="rounded-2xl bg-white">
          <TableSkeleton rows={4} cols={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Coins}
          label="Total Revenue"
          value={formatRs(stats.revenue)}
          sub="From delivered orders"
          tone="amber"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={String(stats.totalOrders)}
          sub={`${stats.pendingOrders} awaiting action`}
          tone="pine"
        />
        <StatCard
          icon={Clock3}
          label="Pending"
          value={String(stats.pendingOrders)}
          sub="Need confirmation calls"
          tone="blue"
        />
        <StatCard
          icon={Package}
          label="Products"
          value={String(stats.totalProducts)}
          sub={`${stats.lowStock.length} low on stock`}
          tone={stats.lowStock.length ? "red" : "pine"}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Low stock alerts */}
        <div className="rounded-2xl border border-stone-100 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-stone-100 px-5 py-4">
            <AlertTriangle className={cn("h-4.5 w-4.5", stats.lowStock.length ? "text-red-500" : "text-pine-500")} />
            <h3 className="text-sm font-extrabold text-pine-950">Low Stock Alerts</h3>
            <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-extrabold text-red-600">
              {stats.lowStock.length}
            </span>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-stone-400">
              All products are well stocked. Great job!
            </p>
          ) : (
            <ul className="divide-y divide-stone-50">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-stone-800">{p.title}</p>
                    <p className="text-[10px] text-stone-400">{p.category}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                      p.stock === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {p.stock === 0 ? "OUT" : `${p.stock} left`}
                  </span>
                  <button
                    onClick={onGoProducts}
                    className="rounded-lg bg-pine-800 px-2.5 py-1.5 text-[10px] font-extrabold uppercase text-white transition hover:bg-pine-700"
                  >
                    Restock
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl border border-stone-100 bg-white shadow-sm lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-stone-100 px-5 py-4">
            <TrendingUp className="h-4.5 w-4.5 text-pine-600" />
            <h3 className="text-sm font-extrabold text-pine-950">Recent Orders</h3>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-stone-400">
              No orders yet. Share your store link to get started!
            </p>
          ) : (
            <ul className="divide-y divide-stone-50">
              {stats.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine-50 text-[10px] font-extrabold text-pine-700">
                    #{shortId(o.id).slice(0, 4)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-stone-800">{o.customerName}</p>
                    <p className="text-[10px] text-stone-400">
                      {o.city} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} className="hidden sm:inline-flex" />
                  <span className="text-xs font-extrabold text-pine-950">{formatRs(o.totalAmount)}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-stone-300" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

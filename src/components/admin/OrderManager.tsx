"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Eye,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  ShoppingBag,
  Smartphone,
  X,
} from "lucide-react";
import { ORDER_STATUSES, OrderDTO, cn, formatRs, shortId } from "@/lib/utils";
import { AuthError, adminFetch } from "@/lib/admin-client";
import { STATUS_STYLES, TableSkeleton, formatDate } from "./bits";
import { useUi } from "@/store/ui";

export default function OrderManager({ onUnauthorized }: { onUnauthorized: () => void }) {
  const toast = useUi((s) => s.toast);
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<OrderDTO | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const load = async () => {
    setLoadFailed(false);
    try {
      const r = await adminFetch("/api/admin/orders");
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json();
      setOrders(Array.isArray(d?.orders) ? d.orders : []);
    } catch (e) {
      if (e instanceof AuthError) {
        onUnauthorized();
        return;
      }
      setOrders(null);
      setLoadFailed(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: orders?.length ?? 0 };
    for (const s of ORDER_STATUSES) c[s] = 0;
    for (const o of orders ?? []) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const visible = useMemo(
    () => (orders ?? []).filter((o) => filter === "All" || o.status === filter),
    [orders, filter]
  );

  async function setStatus(o: OrderDTO, status: string) {
    if (updatingId) return;
    setUpdatingId(o.id);
    try {
      const res = await adminFetch(`/api/admin/orders/${o.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update.");
      setOrders((os) => os!.map((x) => (x.id === o.id ? { ...x, status } : x)));
      setSelected((s) => (s && s.id === o.id ? { ...s, status } : s));
      toast(`Order marked ${status}`, "info");
    } catch (e) {
      if (e instanceof AuthError) {
        onUnauthorized();
        return;
      }
      toast(e instanceof Error ? e.message : "Failed to update.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-stone-100 bg-white shadow-sm">
      {/* Filter chips */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-stone-100 px-5 py-3.5">
        {["All", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold transition",
              filter === s ? "bg-pine-800 text-white shadow" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            )}
          >
            {s}
            <span className={cn("rounded-full px-1.5 text-[9px]", filter === s ? "bg-white/20" : "bg-white")}>
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-stone-100 px-3.5 py-1.5 text-[11px] font-extrabold text-stone-500 transition hover:bg-stone-200"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {!orders ? (
        loadFailed ? (
          <div className="flex flex-col items-center py-14 text-center">
            <ShoppingBag className="h-8 w-8 text-amber-500" />
            <p className="mt-3 text-sm font-extrabold text-stone-700">Couldn&apos;t load orders</p>
            <p className="mt-1 text-xs text-stone-400">Check your connection and try again.</p>
            <button
              onClick={load}
              className="mt-4 rounded-full bg-pine-800 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-pine-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <TableSkeleton rows={6} cols={6} />
        )
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                <th className="px-5 py-3">Order</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Items</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-5 py-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {visible.map((o) => (
                <tr key={o.id} className="align-middle transition hover:bg-stone-50/60">
                  <td className="px-5 py-3">
                    <p className="font-mono font-extrabold text-pine-800">#{shortId(o.id)}</p>
                    <p className="text-[10px] text-stone-400">{formatDate(o.createdAt)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-bold text-stone-800">{o.customerName}</p>
                    <p className="text-[10px] text-stone-400">
                      {o.phone} · {o.city}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex w-fit items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-600">
                      {o.paymentMethod.startsWith("Cash") ? (
                        <Banknote className="h-3 w-3" />
                      ) : (
                        <Smartphone className="h-3 w-3" />
                      )}
                      {o.paymentMethod.startsWith("Cash") ? "COD" : "Wallet"}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-bold text-stone-600">
                    {o.items?.reduce((n, i) => n + i.quantity, 0) ?? 0}
                  </td>
                  <td className="px-3 py-3 font-extrabold text-pine-950">{formatRs(o.totalAmount)}</td>
                  <td className="px-3 py-3">
                    <span className="relative inline-flex items-center">
                      {updatingId === o.id && (
                        <Loader2 className="absolute -left-5 h-3.5 w-3.5 animate-spin text-pine-500" />
                      )}
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => setStatus(o, e.target.value)}
                        className={cn(
                          "cursor-pointer appearance-none rounded-full py-1 pl-3 pr-7 text-[10px] font-extrabold uppercase tracking-wider ring-1 outline-none transition",
                          STATUS_STYLES[o.status] ?? "bg-stone-100 text-stone-600 ring-stone-300"
                        )}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-2 text-[8px]">▼</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setSelected(o)}
                      className="rounded-lg bg-stone-100 p-2 text-stone-500 transition hover:bg-pine-100 hover:text-pine-700"
                      aria-label="View order"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <ShoppingBag className="h-8 w-8 text-stone-200" />
              <p className="mt-2 text-xs text-stone-400">
                No {filter === "All" ? "" : filter.toLowerCase()} orders yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div
            className="animate-fade-in absolute inset-0 bg-pine-950/50 backdrop-blur-[2px]"
            onClick={() => setSelected(null)}
          />
          <aside className="animate-drawer-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#faf8f3] shadow-2xl">
            <div className="flex items-center gap-3 bg-pine-800 px-5 py-4 text-white">
              <div>
                <p className="font-mono text-base font-extrabold">#{shortId(selected.id)}</p>
                <p className="text-[10px] uppercase tracking-widest text-amber-400">
                  {formatDate(selected.createdAt)}
                </p>
              </div>
              <select
                value={selected.status}
                onChange={(e) => setStatus(selected, e.target.value)}
                className="ml-auto cursor-pointer rounded-full border-none bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white outline-none"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s} className="text-stone-800">
                    {s}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {/* Customer */}
              <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-stone-400">
                  Customer
                </p>
                <p className="mt-1.5 text-sm font-extrabold text-pine-950">{selected.customerName}</p>
                <div className="mt-2 space-y-1.5 text-xs text-stone-600">
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-pine-600" /> {selected.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <MessageCircle className="h-3.5 w-3.5 text-pine-600" /> {selected.whatsapp}
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pine-600" />
                    <span>
                      {selected.address}, <b>{selected.city}</b>
                    </span>
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-700">
                  {selected.paymentMethod.startsWith("Cash") ? (
                    <Banknote className="h-4 w-4" />
                  ) : (
                    <Smartphone className="h-4 w-4" />
                  )}
                  {selected.paymentMethod}
                </div>
              </div>

              {/* Items */}
              <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-stone-400">
                  Ordered Items
                </p>
                <ul className="mt-2 divide-y divide-stone-50">
                  {(selected.items ?? []).map((it) => (
                    <li key={it.id} className="flex items-center gap-3 py-2.5">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt="" className="h-11 w-11 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-stone-100 text-[9px] font-bold text-stone-400">
                          N/A
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-stone-800">{it.title}</p>
                        <p className="text-[10px] text-stone-400">
                          {it.selectedWeight} × {it.quantity} · {formatRs(it.pricePerUnit)} each
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-pine-950">
                        {formatRs(it.pricePerUnit * it.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between border-t border-dashed border-stone-200 pt-3 text-sm font-extrabold text-pine-950">
                  <span>Total (incl. delivery)</span>
                  <span>{formatRs(selected.totalAmount)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

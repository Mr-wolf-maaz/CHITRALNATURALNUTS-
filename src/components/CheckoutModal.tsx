"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Copy,
  Loader2,
  MapPin,
  ShoppingBag,
  Smartphone,
  User,
  X,
} from "lucide-react";
import { cartSubtotal, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  cn,
  formatRs,
  readApiJson,
  shortId,
} from "@/lib/utils";

const inputCls =
  "h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-pine-500 focus:bg-white focus:ring-4 focus:ring-pine-500/10";

export default function CheckoutModal() {
  const { checkoutOpen, setCheckoutOpen, setCartOpen, lastOrderId, setLastOrderId, toast } =
    useUi();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    paymentMethod: "Cash on Delivery",
  });
  const [placing, setPlacing] = useState(false);
  const [copied, setCopied] = useState(false);

  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  useEffect(() => {
    document.body.style.overflow = checkoutOpen || lastOrderId ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [checkoutOpen, lastOrderId]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function placeOrder(e: FormEvent) {
    e.preventDefault();
    if (placing) return;
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          whatsapp: form.whatsapp || form.phone,
          items: items.map((i) => ({ productId: i.productId, weight: i.weight, qty: i.qty })),
        }),
      });
      const data = await readApiJson<{ orderId?: string }>(res);
      if (!data.orderId) throw new Error("Could not place your order. Please try again.");
      clear();
      setCheckoutOpen(false);
      setCartOpen(false);
      setLastOrderId(data.orderId);
      setForm({ customerName: "", phone: "", whatsapp: "", address: "", city: "", paymentMethod: "Cash on Delivery" });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not place order.", "error");
    } finally {
      setPlacing(false);
    }
  }

  /* ---------- Success modal ---------- */
  if (lastOrderId) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="animate-fade-in absolute inset-0 bg-pine-950/60 backdrop-blur-sm" />
        <div className="animate-modal-in relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pine-50 ring-8 ring-pine-50/50">
            <CheckCircle2 className="h-11 w-11 text-pine-600" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-black text-pine-950">
            Order Placed Successfully!
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Shukriya! Our team will call you shortly to confirm your order.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 px-4 py-2 font-mono text-lg font-extrabold tracking-widest text-amber-700">
              #{shortId(lastOrderId)}
            </span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(lastOrderId).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition hover:border-pine-400 hover:text-pine-700"
              aria-label="Copy order ID"
            >
              {copied ? <CheckCircle2 className="h-4.5 w-4.5 text-pine-600" /> : <Copy className="h-4.5 w-4.5" />}
            </button>
          </div>
          <div className="mt-5 rounded-2xl bg-stone-50 p-4 text-left text-xs leading-relaxed text-stone-500">
            <p className="flex gap-2">
              <Banknote className="h-4 w-4 shrink-0 text-pine-600" />
              Cash on Delivery orders ship after a quick confirmation call.
            </p>
            <p className="mt-1.5 flex gap-2">
              <Smartphone className="h-4 w-4 shrink-0 text-pine-600" />
              For Easypaisa / JazzCash, send payment to <b className="text-stone-700">0340-8895642 (+92 340 8895642)</b> and share the receipt on WhatsApp.
            </p>
          </div>
          <button
            onClick={() => setLastOrderId(null)}
            className="mt-6 w-full rounded-xl bg-pine-800 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-pine-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (!checkoutOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-pine-950/60 backdrop-blur-sm"
        onClick={() => !placing && setCheckoutOpen(false)}
      />
      <div className="animate-modal-in relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-stone-100 bg-white/95 px-6 py-4 backdrop-blur">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pine-800">
            <ShoppingBag className="h-4.5 w-4.5 text-amber-400" />
          </span>
          <div>
            <h2 className="font-display text-lg font-black text-pine-950">Checkout</h2>
            <p className="text-[11px] text-stone-400">Delivery details & payment</p>
          </div>
          <button
            onClick={() => !placing && setCheckoutOpen(false)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100"
            aria-label="Close checkout"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={placeOrder} className="space-y-4 px-6 py-5">
          {/* Contact */}
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-pine-800">
              <User className="h-3.5 w-3.5" /> Full Name
            </label>
            <input required value={form.customerName} onChange={set("customerName")} placeholder="e.g. Shah Zaman" className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-pine-800">
                  Mobile No.
                </label>
                <input required value={form.phone} onChange={set("phone")} inputMode="tel" placeholder="03xx-xxxxxxx" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-pine-800">
                  WhatsApp
                </label>
                <input value={form.whatsapp} onChange={set("whatsapp")} inputMode="tel" placeholder="Same as mobile" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-pine-800">
              <MapPin className="h-3.5 w-3.5" /> Delivery Address
            </label>
            <textarea
              required
              value={form.address}
              onChange={set("address")}
              rows={2}
              placeholder="House, street, area, landmark..."
              className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-pine-500 focus:bg-white focus:ring-4 focus:ring-pine-500/10"
            />
            <input required value={form.city} onChange={set("city")} placeholder="City (e.g. Chitral, Islamabad, Lahore)" className={inputCls} />
          </div>

          {/* Payment */}
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-pine-800">
              Payment Method
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "Cash on Delivery", label: "Cash on Delivery", icon: Banknote, hint: "Pay at your doorstep" },
                { id: "Easypaisa / JazzCash Manual", label: "Easypaisa / JazzCash", icon: Smartphone, hint: "Manual transfer" },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setForm((f) => ({ ...f, paymentMethod: m.id }))}
                  className={cn(
                    "rounded-2xl border-2 p-3 text-left transition",
                    form.paymentMethod === m.id
                      ? "border-pine-600 bg-pine-50 ring-4 ring-pine-600/10"
                      : "border-stone-200 hover:border-pine-300"
                  )}
                >
                  <m.icon className={cn("h-5 w-5", form.paymentMethod === m.id ? "text-pine-700" : "text-stone-400")} />
                  <p className="mt-1.5 text-xs font-extrabold text-stone-800">{m.label}</p>
                  <p className="text-[10px] text-stone-400">{m.hint}</p>
                </button>
              ))}
            </div>
            {form.paymentMethod === "Easypaisa / JazzCash Manual" && (
              <p className="animate-slide-up mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700">
                Send to <b>0340-8895642 (+92 340 8895642) · Chitral Natural Nuts</b> — our team verifies on WhatsApp before dispatch.
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-2xl bg-stone-50 p-4 text-sm">
            <div className="flex justify-between text-stone-500">
              <span>{items.reduce((n, i) => n + i.qty, 0)} items</span>
              <span className="font-bold text-stone-800">{formatRs(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-stone-500">
              <span>Shipping</span>
              <span className="font-bold text-stone-800">
                {shipping === 0 ? <span className="text-pine-600">FREE</span> : formatRs(shipping)}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-dashed border-stone-200 pt-2 text-base font-extrabold text-pine-950">
              <span>Total</span>
              <span>{formatRs(subtotal + shipping)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={placing || items.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-extrabold uppercase tracking-wider text-pine-950 shadow-lg shadow-amber-500/25 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
          >
            {placing && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} />}
            {placing ? "Placing Order..." : `Place Order · ${formatRs(subtotal + shipping)}`}
          </button>
        </form>
      </div>
    </div>
  );
}

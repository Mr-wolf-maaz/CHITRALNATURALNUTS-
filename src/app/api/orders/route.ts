import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  effectiveKgPrice,
  priceForWeight,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAYMENT_METHODS = ["Cash on Delivery", "Easypaisa / JazzCash Manual"];

type IncomingItem = { productId?: string; weight?: string; qty?: number };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customerName = String(body.customerName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const whatsapp = String(body.whatsapp ?? "").trim();
    const address = String(body.address ?? "").trim();
    const city = String(body.city ?? "").trim();
    const paymentMethod = String(body.paymentMethod ?? "").trim();
    const items: IncomingItem[] = Array.isArray(body.items) ? body.items : [];

    if (!customerName || !phone || !address || !city) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }
    if (phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Please enter a valid mobile number." }, { status: 400 });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
    }
    if (items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const ids = [...new Set(items.map((i) => String(i.productId ?? "")))].filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // Re-price everything server-side — never trust client totals.
    const rows = await db.select().from(products).where(inArray(products.id, ids));
    const byId = new Map(rows.map((r) => [r.id, r]));

    const lineItems: {
      productId: string;
      quantity: number;
      pricePerUnit: number;
      selectedWeight: string;
    }[] = [];

    let subtotal = 0;
    for (const raw of items) {
      const p = byId.get(String(raw.productId ?? ""));
      if (!p) continue;
      const qty = Math.max(1, Math.min(99, Math.floor(Number(raw.qty) || 1)));
      const weight = p.weightOptions.includes(String(raw.weight))
        ? String(raw.weight)
        : p.weightOptions[0] ?? "1kg";
      if (p.stock <= 0) {
        return NextResponse.json(
          { error: `"${p.title}" is out of stock. Please remove it from your cart.` },
          { status: 400 }
        );
      }
      const unit = priceForWeight(effectiveKgPrice({
        originalPrice: Number(p.originalPrice),
        salePrice: p.salePrice === null ? null : Number(p.salePrice),
      }), weight);
      subtotal += unit * qty;
      lineItems.push({ productId: p.id, quantity: qty, pricePerUnit: unit, selectedWeight: weight });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "No valid items in cart." }, { status: 400 });
    }

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    const orderId = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          customerName,
          phone,
          whatsapp: whatsapp || phone,
          address,
          city,
          paymentMethod,
          totalAmount: String(total),
          status: "Pending",
        })
        .returning({ id: orders.id });

      await tx.insert(orderItems).values(
        lineItems.map((li) => ({
          orderId: order.id,
          productId: li.productId,
          quantity: li.quantity,
          pricePerUnit: String(li.pricePerUnit),
          selectedWeight: li.selectedWeight,
        }))
      );

      for (const li of lineItems) {
        await tx
          .update(products)
          .set({ stock: sql`greatest(${products.stock} - ${li.quantity}, 0)` })
          .where(eq(products.id, li.productId));
      }

      return order.id as string;
    });

    return NextResponse.json({ ok: true, orderId, total });
  } catch (e) {
    console.error("POST /api/orders", e);
    return NextResponse.json({ error: "Could not place your order. Please try again." }, { status: 500 });
  }
}

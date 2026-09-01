import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { isAdminAuthed } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
    const ids = rows.map((o) => o.id);
    const items = ids.length
      ? await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            pricePerUnit: orderItems.pricePerUnit,
            selectedWeight: orderItems.selectedWeight,
            title: products.title,
            imageUrl: products.imageUrl,
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(inArray(orderItems.orderId, ids))
      : [];

    const byOrder = new Map<string, typeof items>();
    for (const it of items) {
      const list = byOrder.get(it.orderId) ?? [];
      list.push(it);
      byOrder.set(it.orderId, list);
    }

    return NextResponse.json({
      orders: rows.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        phone: o.phone,
        whatsapp: o.whatsapp,
        address: o.address,
        city: o.city,
        paymentMethod: o.paymentMethod,
        totalAmount: Number(o.totalAmount),
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        items: (byOrder.get(o.id) ?? []).map((it) => ({
          id: it.id,
          productId: it.productId,
          quantity: it.quantity,
          pricePerUnit: Number(it.pricePerUnit),
          selectedWeight: it.selectedWeight,
          title: it.title ?? "Removed product",
          imageUrl: it.imageUrl ?? "",
        })),
      })),
    });
  } catch (e) {
    console.error("GET /api/admin/orders", e);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

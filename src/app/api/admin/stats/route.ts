import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { desc, eq, lt, sql } from "drizzle-orm";
import { isAdminAuthed } from "@/lib/auth";
import { serializeProduct } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [rev] = await db
      .select({
        revenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(eq(orders.status, "Delivered"));

    const [counts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) filter (where ${orders.status} = 'Pending')::int`,
      })
      .from(orders);

    const [productCount] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(products);

    const lowStock = await db
      .select()
      .from(products)
      .where(lt(products.stock, 5))
      .orderBy(products.stock);

    const recent = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6);

    return NextResponse.json({
      revenue: Number(rev?.revenue ?? 0),
      totalOrders: counts?.total ?? 0,
      pendingOrders: counts?.pending ?? 0,
      totalProducts: productCount?.total ?? 0,
      lowStock: lowStock.map(serializeProduct),
      recentOrders: recent.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        city: o.city,
        totalAmount: Number(o.totalAmount),
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error("GET /api/admin/stats", e);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}

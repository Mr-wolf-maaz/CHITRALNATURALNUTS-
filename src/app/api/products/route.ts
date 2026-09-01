import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { serializeProduct } from "@/lib/utils";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(products).orderBy(asc(products.createdAt));
    return NextResponse.json({ products: rows.map(serializeProduct) });
  } catch (e) {
    console.error("GET /api/products", e);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, id))
      .orderBy(desc(reviews.createdAt))
      .limit(50);
    const [agg] = await db
      .select({
        avg: sql<string>`coalesce(avg(${reviews.rating}), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.productId, id));
    return NextResponse.json({
      reviews: rows.map((r) => ({
        id: r.id,
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
      })),
      avg: Number(agg?.avg ?? 0),
      count: agg?.count ?? 0,
    });
  } catch (e) {
    console.error("GET reviews", e);
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const name = String(body.name ?? "").trim().slice(0, 60);
    const comment = String(body.comment ?? "").trim().slice(0, 600);
    const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 0)));

    if (name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (comment.length < 4) {
      return NextResponse.json({ error: "Please write a short comment (at least 4 characters)." }, { status: 400 });
    }

    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const [row] = await db
      .insert(reviews)
      .values({ productId: id, name, rating, comment })
      .returning();

    return NextResponse.json({
      review: {
        id: row.id,
        name: row.name,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("POST reviews", e);
    return NextResponse.json({ error: "Could not submit your review." }, { status: 500 });
  }
}

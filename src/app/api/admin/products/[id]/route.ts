import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdminAuthed } from "@/lib/auth";
import { serializeProduct } from "@/lib/utils";

export const dynamic = "force-dynamic";

const WEIGHTS = new Set(["250g", "500g", "1kg"]);

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const patch: Record<string, unknown> = {};

    if (body.title !== undefined) {
      const t = String(body.title).trim();
      if (!t) return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
      patch.title = t;
    }
    if (body.description !== undefined) patch.description = String(body.description);
    if (body.category !== undefined) {
      const c = String(body.category).trim();
      if (!c) return NextResponse.json({ error: "Category cannot be empty." }, { status: 400 });
      patch.category = c;
    }
    if (body.originalPrice !== undefined) {
      const v = Number(body.originalPrice);
      if (!Number.isFinite(v) || v <= 0)
        return NextResponse.json({ error: "Invalid price." }, { status: 400 });
      patch.originalPrice = String(v);
    }
    if (body.salePrice !== undefined) {
      if (body.salePrice === null || body.salePrice === "") {
        patch.salePrice = null;
      } else {
        const v = Number(body.salePrice);
        if (!Number.isFinite(v) || v <= 0)
          return NextResponse.json({ error: "Invalid sale price." }, { status: 400 });
        patch.salePrice = String(v);
      }
    }
    if (body.stock !== undefined) {
      const v = Math.floor(Number(body.stock));
      if (!Number.isFinite(v) || v < 0)
        return NextResponse.json({ error: "Invalid stock." }, { status: 400 });
      patch.stock = v;
    }
    if (body.imageUrl !== undefined) patch.imageUrl = String(body.imageUrl);
    if (body.isFeatured !== undefined) patch.isFeatured = Boolean(body.isFeatured);
    if (body.weightOptions !== undefined) {
      const w = (Array.isArray(body.weightOptions) ? body.weightOptions : [])
        .map(String)
        .filter((x: string) => WEIGHTS.has(x));
      if (w.length === 0)
        return NextResponse.json({ error: "Pick at least one weight option." }, { status: 400 });
      patch.weightOptions = w;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const [row] = await db.update(products).set(patch).where(eq(products.id, id)).returning();
    if (!row) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ product: serializeProduct(row) });
  } catch (e) {
    console.error("PUT /api/admin/products/[id]", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await ctx.params;
    await db.transaction(async (tx) => {
      await tx.delete(orderItems).where(eq(orderItems.productId, id));
      await tx.delete(products).where(eq(products.id, id));
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/products/[id]", e);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

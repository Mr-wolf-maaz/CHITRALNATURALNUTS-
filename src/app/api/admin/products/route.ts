import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdminAuthed } from "@/lib/auth";
import { serializeProduct } from "@/lib/utils";

export const dynamic = "force-dynamic";

const WEIGHTS = new Set(["250g", "500g", "1kg"]);

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const category = String(body.category ?? "").trim();
    const originalPrice = Number(body.originalPrice);
    const salePrice =
      body.salePrice === null || body.salePrice === undefined || body.salePrice === ""
        ? null
        : Number(body.salePrice);
    const stock = Math.max(0, Math.floor(Number(body.stock) || 0));
    const weightOptions = (Array.isArray(body.weightOptions) ? body.weightOptions : [])
      .map(String)
      .filter((w: string) => WEIGHTS.has(w));

    if (!title || !category || !Number.isFinite(originalPrice) || originalPrice <= 0) {
      return NextResponse.json({ error: "Title, category and a valid price are required." }, { status: 400 });
    }
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice <= 0)) {
      return NextResponse.json({ error: "Invalid sale price." }, { status: 400 });
    }

    const [row] = await db
      .insert(products)
      .values({
        title,
        description: String(body.description ?? ""),
        category,
        weightOptions: weightOptions.length ? weightOptions : ["250g", "500g", "1kg"],
        originalPrice: String(originalPrice),
        salePrice: salePrice === null ? null : String(salePrice),
        stock,
        imageUrl: String(body.imageUrl ?? ""),
        isFeatured: Boolean(body.isFeatured),
      })
      .returning();

    return NextResponse.json({ product: serializeProduct(row) });
  } catch (e) {
    console.error("POST /api/admin/products", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

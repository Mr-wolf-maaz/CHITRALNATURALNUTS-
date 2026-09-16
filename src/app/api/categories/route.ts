import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(categories).orderBy(asc(categories.createdAt));
    return NextResponse.json({ categories: rows });
  } catch (error) {
    console.error("GET /api/categories", error);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}

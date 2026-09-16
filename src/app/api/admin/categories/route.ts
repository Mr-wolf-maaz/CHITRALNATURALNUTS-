import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { isAdminAuthed } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(categories).orderBy(asc(categories.createdAt));
  return NextResponse.json({ categories: rows });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const urdu = String(body.urdu ?? "").trim();
    const imageUrl = String(body.imageUrl ?? "").trim();
    if (!name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    const [category] = await db.insert(categories).values({ name, urdu, imageUrl }).returning();
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/categories", error);
    return NextResponse.json({ error: "Category already exists or could not be created." }, { status: 400 });
  }
}

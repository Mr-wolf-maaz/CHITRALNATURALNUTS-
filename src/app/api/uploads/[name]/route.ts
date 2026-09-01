import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};

type Ctx = { params: Promise<{ name: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { name } = await ctx.params;
  if (!/^[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|webp|avif|gif)$/i.test(name)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }
  try {
    const file = await readFile(path.join(process.cwd(), "uploads", name));
    const ext = name.split(".").pop()!.toLowerCase();
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

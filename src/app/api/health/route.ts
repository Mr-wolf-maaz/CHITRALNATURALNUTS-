import { db } from "@/db";
import { sql } from "drizzle-orm";
import { APP_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, version: APP_VERSION });
  } catch {
    return Response.json({ ok: false, version: APP_VERSION }, { status: 500 });
  }
}

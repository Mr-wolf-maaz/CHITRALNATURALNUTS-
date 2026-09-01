import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCredentials, makeToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = adminCredentials();
    if (String(body.email).trim().toLowerCase() !== email.toLowerCase() || String(body.password) !== password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const token = makeToken();
    const res = NextResponse.json({ ok: true, token });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      // CHIPS + SameSite=None keeps the cookie usable even inside cross-site
      // iframes; the Bearer token returned above is the primary mechanism.
      sameSite: "none",
      secure: true,
      partitioned: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}

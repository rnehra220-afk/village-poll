import { NextResponse } from "next/server";
import crypto from "crypto";
import { signAdminSession, adminCookieName } from "@/lib/tokens";
import { rateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/validate";

export const dynamic = "force-dynamic";

/** POST /api/admin/login — { password } → sets signed httpOnly session cookie. */
export async function POST(req) {
  const ip = getClientIp(req);
  const rl = rateLimit(`admin-login:${ip}`, { limit: 10, windowMs: 600_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD || "";
  const given = String(body.password || "");
  const ok =
    expected &&
    given &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));

  if (!ok) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), signAdminSession(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 3600,
  });
  return res;
}

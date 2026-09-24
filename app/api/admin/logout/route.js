import { NextResponse } from "next/server";
import { adminCookieName } from "@/lib/tokens";

export const dynamic = "force-dynamic";

/** POST /api/admin/logout — clears the admin session cookie. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { cleanText } from "@/lib/validate";

export const dynamic = "force-dynamic";

/** GET /api/admin/villages?status=pending — custom villages queue (admin only). */
export async function GET(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  const status = cleanText(new URL(req.url).searchParams.get("status") || "pending", 20);
  const db = getServiceClient();
  const { data } = await db
    .from("villages")
    .select("id, village_name, gram_panchayat, block, district, state, source, verification_status, created_at")
    .eq("verification_status", ["approved", "rejected"].includes(status) ? status : "pending")
    .order("created_at", { ascending: false })
    .limit(100);
  return NextResponse.json({ villages: data || [] });
}

/** POST /api/admin/villages — { id, action: "approved"|"rejected" } (admin only). */
export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const status = body.action === "rejected" ? "rejected" : "approved";
  const db = getServiceClient();
  await db.from("villages").update({ verification_status: status }).eq("id", cleanText(body.id, 60));
  return NextResponse.json({ ok: true });
}

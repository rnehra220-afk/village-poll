import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { cleanText } from "@/lib/validate";

export const dynamic = "force-dynamic";

/** GET /api/admin/reports — open reports (admin only). */
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  const db = getServiceClient();
  const { data } = await db
    .from("reports")
    .select("id, reason, details, status, created_at, polls (id, slug, village_name, district, state)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(100);
  return NextResponse.json({ reports: data || [] });
}

/** POST /api/admin/reports — { id, action: "reviewed"|"dismissed" } (admin only). */
export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const id = cleanText(body.id, 60);
  const status = body.action === "dismissed" ? "dismissed" : "reviewed";
  const db = getServiceClient();
  await db.from("reports").update({ status }).eq("id", id);
  return NextResponse.json({ ok: true });
}

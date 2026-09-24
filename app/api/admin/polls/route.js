import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { cleanText } from "@/lib/validate";

export const dynamic = "force-dynamic";

const ACTIONS = ["hide", "restore", "close", "reopen", "delete"];

/** GET /api/admin/polls?q= — list polls newest first (admin only). */
export async function GET(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  const q = cleanText(new URL(req.url).searchParams.get("q") || "", 100);
  const db = getServiceClient();
  let query = db
    .from("polls")
    .select("id, slug, village_name, district, state, poll_type, status, views, shares, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (q) query = query.or(`village_name.ilike.%${q}%,district.ilike.%${q}%,state.ilike.%${q}%`);
  const { data } = await query;
  return NextResponse.json({ polls: data || [] });
}

/**
 * POST /api/admin/polls — moderate a poll (admin only).
 * Body: { id, action: "hide"|"restore"|"close"|"reopen"|"delete" }
 */
export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const id = cleanText(body.id, 60);
  const action = cleanText(body.action, 20);
  if (!ACTIONS.includes(action)) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const db = getServiceClient();
  if (action === "delete") {
    await db.from("polls").delete().eq("id", id);
  } else {
    const status = action === "hide" ? "hidden" : action === "restore" || action === "reopen" ? "active" : "closed";
    await db.from("polls").update({ status }).eq("id", id);
  }
  return NextResponse.json({ ok: true });
}

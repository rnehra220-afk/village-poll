import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { hashToken, verifyAdminSession, adminCookieName } from "@/lib/tokens";

export const dynamic = "force-dynamic";

function authorized(req, poll) {
  // Admin session cookie…
  const adminCookie = cookies().get(adminCookieName())?.value;
  if (verifyAdminSession(adminCookie)) return true;
  // …or the poll's own creator token (Authorization: Bearer <token>).
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token && poll.creator_token_hash === hashToken(token)) return true;
  return false;
}

/** GET /api/polls/[id] — public poll details (active/closed only). */
export async function GET(_req, { params }) {
  const db = getServiceClient();
  const { data: poll } = await db
    .from("polls")
    .select("id, slug, state, district, block, village_name, poll_type, ward_number, status, expires_at, views, shares, created_at")
    .eq("id", params.id)
    .in("status", ["active", "closed"])
    .single();
  if (!poll) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const { data: candidates } = await db
    .from("candidates")
    .select("id, name, photo_url, description")
    .eq("poll_id", poll.id)
    .order("position");
  return NextResponse.json({ poll, candidates: candidates || [] });
}

/**
 * PATCH /api/polls/[id] — close or reopen (creator token or admin).
 * Body: { action: "close" | "reopen" }
 */
export async function PATCH(req, { params }) {
  const db = getServiceClient();
  const { data: poll } = await db.from("polls").select("id, creator_token_hash, status").eq("id", params.id).single();
  if (!poll) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!authorized(req, poll)) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const status = body.action === "reopen" ? "active" : "closed";
  await db.from("polls").update({ status }).eq("id", poll.id);
  return NextResponse.json({ ok: true, status });
}

/** DELETE /api/polls/[id] — permanent delete (creator token or admin). */
export async function DELETE(req, { params }) {
  const db = getServiceClient();
  const { data: poll } = await db.from("polls").select("id, creator_token_hash").eq("id", params.id).single();
  if (!poll) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!authorized(req, poll)) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  await db.from("polls").delete().eq("id", poll.id);
  return NextResponse.json({ ok: true });
}

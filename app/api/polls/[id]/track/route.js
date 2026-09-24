import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/validate";

export const dynamic = "force-dynamic";

/**
 * POST /api/polls/[id]/track — anonymous view/share counting.
 * Body: { event: "view" | "share" }
 */
export async function POST(req, { params }) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const event = body.event === "share" ? "share" : "view";
  const ip = getClientIp(req);

  // One counted view per IP per poll per 5 minutes (share clicks counted each time, lightly limited).
  const rl = rateLimit(`track:${event}:${params.id}:${ip}`, {
    limit: event === "view" ? 1 : 5,
    windowMs: event === "view" ? 300_000 : 60_000,
  });
  if (!rl.ok) return NextResponse.json({ ok: true, deduped: true });

  const db = getServiceClient();
  const field = event === "share" ? "shares" : "views";
  const { data: poll } = await db.from("polls").select("id").eq("id", params.id).single();
  if (!poll) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // Atomic-ish increment via select+update is fine for MVP counters.
  const { data: cur } = await db.from("polls").select(field).eq("id", params.id).single();
  await db.from("polls").update({ [field]: (cur?.[field] || 0) + 1 }).eq("id", params.id);
  await db.from("poll_events").insert({ poll_id: params.id, event });

  return NextResponse.json({ ok: true });
}

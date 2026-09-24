import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { hashToken } from "@/lib/tokens";
import { cleanText } from "@/lib/validate";
import { rateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/validate";
import { REPORT_REASONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/reports — report a poll for moderation.
 * Body: { poll_id, reason, details? }
 */
export async function POST(req) {
  const ip = getClientIp(req);
  const rl = rateLimit(`report:${ip}`, { limit: 10, windowMs: 3600_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const pollId = cleanText(body.poll_id, 60);
  const reason = cleanText(body.reason, 40);
  const details = cleanText(body.details, 1000);

  if (!pollId) return NextResponse.json({ error: "Missing poll." }, { status: 400 });
  if (!REPORT_REASONS.includes(reason)) return NextResponse.json({ error: "Invalid reason." }, { status: 400 });

  const db = getServiceClient();
  const { data: poll } = await db.from("polls").select("id").eq("id", pollId).single();
  if (!poll) return NextResponse.json({ error: "Poll not found." }, { status: 404 });

  await db.from("reports").insert({ poll_id: pollId, reason, details: details || null });
  return NextResponse.json({ ok: true });
}

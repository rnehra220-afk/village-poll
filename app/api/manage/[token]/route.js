import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { hashToken } from "@/lib/tokens";
import { cleanText } from "@/lib/validate";

export const dynamic = "force-dynamic";

/** GET /api/manage/[token] — poll + stats for the creator's private link. */
export async function GET(_req, { params }) {
  const token = cleanText(params.token, 100);
  if (!token) return NextResponse.json({ error: "Invalid link." }, { status: 400 });
  const db = getServiceClient();
  const { data: poll } = await db
    .from("polls")
    .select("id, slug, village_name, district, state, poll_type, ward_number, status, views, shares, expires_at, created_at")
    .eq("creator_token_hash", hashToken(token))
    .single();
  if (!poll) return NextResponse.json({ error: "Invalid link." }, { status: 404 });

  const { count: votes } = await db.from("votes").select("id", { count: "exact", head: true }).eq("poll_id", poll.id);
  const { data: candidates } = await db.from("candidates").select("id, name").eq("poll_id", poll.id).order("position");

  return NextResponse.json({ poll: { ...poll, votes: votes || 0 }, candidates: candidates || [], token });
}

import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** GET /api/polls/[id]/results — vote counts + percentages per candidate. */
export async function GET(_req, { params }) {
  const db = getServiceClient();

  const { data: poll } = await db
    .from("polls")
    .select("id, status")
    .eq("id", params.id)
    .in("status", ["active", "closed"])
    .single();
  if (!poll) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { data: candidates } = await db
    .from("candidates")
    .select("id, name")
    .eq("poll_id", poll.id)
    .order("position");

  const { data: votes } = await db.from("votes").select("candidate_id").eq("poll_id", poll.id);

  const counts = {};
  for (const v of votes || []) counts[v.candidate_id] = (counts[v.candidate_id] || 0) + 1;
  const total = (votes || []).length;

  return NextResponse.json({
    total,
    results: (candidates || []).map((c) => ({
      candidate_id: c.id,
      name: c.name,
      votes: counts[c.id] || 0,
      pct: total ? Math.round(((counts[c.id] || 0) / total) * 1000) / 10 : 0,
    })),
  });
}

import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** GET /api/trending — trending (by views) + recent polls for the homepage. */
export async function GET() {
  const db = getServiceClient();

  const base = () =>
    db
      .from("polls")
      .select("id, slug, village_name, district, state, poll_type, ward_number, views, created_at")
      .eq("status", "active")
      .limit(8);

  const [{ data: trending }, { data: recent }] = await Promise.all([
    base().order("views", { ascending: false }),
    base().order("created_at", { ascending: false }),
  ]);

  const ids = [...(trending || []), ...(recent || [])].map((p) => p.id);
  let counts = {};
  if (ids.length) {
    const { data: votes } = await db.from("votes").select("poll_id").in("poll_id", [...new Set(ids)]);
    for (const v of votes || []) counts[v.poll_id] = (counts[v.poll_id] || 0) + 1;
  }
  const withVotes = (arr) => (arr || []).map((p) => ({ ...p, votes: counts[p.id] || 0 }));

  // Site-wide stats for the hero.
  const [{ count: pollCount }, { count: voteCount }] = await Promise.all([
    db.from("polls").select("id", { count: "exact", head: true }).neq("status", "hidden"),
    db.from("votes").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    trending: withVotes(trending),
    recent: withVotes(recent),
    stats: { polls: pollCount || 0, votes: voteCount || 0 },
  }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    }
  });
}

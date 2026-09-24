import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/overview — dashboard metrics (admin only). */
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  const db = getServiceClient();

  const [
    { count: polls },
    { count: activePolls },
    { count: votes },
    { count: villages },
    { count: openReports },
  ] = await Promise.all([
    db.from("polls").select("id", { count: "exact", head: true }),
    db.from("polls").select("id", { count: "exact", head: true }).eq("status", "active"),
    db.from("votes").select("id", { count: "exact", head: true }),
    db.from("villages").select("id", { count: "exact", head: true }),
    db.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  // Votes per day (last 14 days) for a tiny chart.
  const since = new Date(Date.now() - 14 * 86400_000).toISOString();
  const { data: recentVotes } = await db.from("votes").select("created_at").gte("created_at", since);

  const perDay = {};
  for (const v of recentVotes || []) {
    const d = v.created_at.slice(0, 10);
    perDay[d] = (perDay[d] || 0) + 1;
  }

  return NextResponse.json({
    polls: polls || 0,
    activePolls: activePolls || 0,
    votes: votes || 0,
    villages: villages || 0,
    openReports: openReports || 0,
    votesPerDay: perDay,
  });
}

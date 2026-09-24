import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { cleanText } from "@/lib/validate";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=&state=&district=&type=
 * Public poll search (active/closed polls only).
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = cleanText(searchParams.get("q") || "", 100);
  const state = cleanText(searchParams.get("state") || "", 100);
  const district = cleanText(searchParams.get("district") || "", 100);
  const type = cleanText(searchParams.get("type") || "", 30);

  const db = getServiceClient();
  let query = db
    .from("polls")
    .select("id, slug, village_name, district, state, poll_type, ward_number, status, views, created_at")
    .in("status", ["active", "closed"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) query = query.or(`village_name.ilike.%${q}%,district.ilike.%${q}%,state.ilike.%${q}%`);
  if (state && state !== "all") query = query.eq("state", state);
  if (district) query = query.ilike("district", `%${district}%`);
  if (type && type !== "all") query = query.eq("poll_type", type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Search failed." }, { status: 500 });

  // Attach vote counts.
  const ids = (data || []).map((p) => p.id);
  let counts = {};
  if (ids.length) {
    const { data: votes } = await db.from("votes").select("poll_id").in("poll_id", ids);
    for (const v of votes || []) counts[v.poll_id] = (counts[v.poll_id] || 0) + 1;
  }

  return NextResponse.json({
    results: (data || []).map((p) => ({ ...p, votes: counts[p.id] || 0 })),
  });
}

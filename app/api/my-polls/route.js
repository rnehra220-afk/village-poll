import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { hashToken } from "@/lib/tokens";

export const dynamic = "force-dynamic";

/**
 * POST /api/my-polls — polls created on this device.
 * Body: { tokens: ["..."] } (raw creator tokens from localStorage)
 */
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ polls: [] });
  }
  const tokens = Array.isArray(body.tokens) ? body.tokens.filter((t) => typeof t === "string").slice(0, 50) : [];
  if (!tokens.length) return NextResponse.json({ polls: [] });

  const hashes = tokens.map(hashToken);
  const db = getServiceClient();
  const { data } = await db
    .from("polls")
    .select("id, slug, village_name, district, state, poll_type, ward_number, status, views, shares, created_at")
    .in("creator_token_hash", hashes)
    .order("created_at", { ascending: false });

  const ids = (data || []).map((p) => p.id);
  let counts = {};
  if (ids.length) {
    const { data: votes } = await db.from("votes").select("poll_id").in("poll_id", ids);
    for (const v of votes || []) counts[v.poll_id] = (counts[v.poll_id] || 0) + 1;
  }

  // Return token alongside each poll so the UI can build manage actions.
  const tokenByHash = {};
  tokens.forEach((t) => (tokenByHash[hashToken(t)] = t));
  const { data: withHashes } = await db
    .from("polls")
    .select("id, creator_token_hash")
    .in("creator_token_hash", hashes);

  const hashById = {};
  for (const p of withHashes || []) hashById[p.id] = p.creator_token_hash;

  return NextResponse.json({
    polls: (data || []).map((p) => ({
      ...p,
      votes: counts[p.id] || 0,
      manageToken: tokenByHash[hashById[p.id]] || null,
    })),
  });
}

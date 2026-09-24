import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { cleanText, isValidHttpUrl } from "@/lib/validate";
import { rateLimit } from "@/lib/rateLimit";
import { newCreatorToken, hashToken } from "@/lib/tokens";
import { STATES, slugify, shortId } from "@/lib/geo";
import { MAX_CANDIDATES, MIN_CANDIDATES } from "@/lib/constants";
import { getClientIp } from "@/lib/validate";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["sarpanch", "ward_panch", "zila_parishad"];

function bad(msg, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

/**
 * POST /api/polls — create a new opinion poll.
 * Body: { state, district, block?, villageName, gramPanchayat?,
 *         pollType, wardNumber?, candidates: [{name, photo_url?, description?}],
 *         expiresInDays? (number|null), hp? (honeypot) }
 * Returns: { id, slug, url, manageToken, manageUrl }
 */
export async function POST(req) {
  const ip = getClientIp(req);
  const rl = rateLimit(`create:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) return bad("Too many requests. Please wait a minute and try again.", 429);

  let body;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request body.");
  }

  // Honeypot anti-bot: real users never fill this hidden field.
  if (body.hp) return bad("Invalid request.");

  const state = cleanText(body.state, 100);
  const district = cleanText(body.district, 100);
  const block = cleanText(body.block, 100);
  const villageName = cleanText(body.villageName, 120);
  const gramPanchayat = cleanText(body.gramPanchayat, 120);
  const pollType = cleanText(body.pollType, 30);
  const wardNumber = cleanText(body.wardNumber, 10);
  const expiresInDays = body.expiresInDays;

  if (!STATES.includes(state)) return bad("Please select a valid state.");
  if (!district) return bad("Please enter a district.");
  if (!villageName) return bad("Please enter a village name.");
  if (!VALID_TYPES.includes(pollType)) return bad("Invalid poll type.");
  if (pollType === "ward_panch" && !wardNumber) return bad("Please enter the ward number.");

  const rawCandidates = Array.isArray(body.candidates) ? body.candidates : [];
  if (rawCandidates.length < MIN_CANDIDATES) return bad("Please add at least two candidates.");
  if (rawCandidates.length > MAX_CANDIDATES) return bad(`Maximum ${MAX_CANDIDATES} candidates allowed.`);

  const candidates = [];
  for (const c of rawCandidates) {
    const name = cleanText(c?.name, 100);
    if (!name) return bad("Please enter a name for every candidate.");
    const photoUrl = cleanText(c?.photo_url, 500);
    candidates.push({
      name,
      photo_url: photoUrl && isValidHttpUrl(photoUrl) ? photoUrl : null,
      description: cleanText(c?.description, 300) || null,
    });
  }

  let expiresAt = null;
  if (typeof expiresInDays === "number" && expiresInDays > 0 && expiresInDays <= 365) {
    expiresAt = new Date(Date.now() + expiresInDays * 86400_000).toISOString();
  }

  const db = getServiceClient();
  const baseSlug = slugify(`${villageName} ${pollType.replace(/_/g, "-")}`) || "poll";

  // Reuse an existing custom-village row if the same village was entered before.
  let villageId = null;
  const { data: existingVillage } = await db
    .from("villages")
    .select("id")
    .eq("state", state)
    .eq("district", district)
    .ilike("village_name", villageName)
    .limit(1)
    .maybeSingle();
  if (existingVillage) {
    villageId = existingVillage.id;
  } else {
    const { data: v } = await db
      .from("villages")
      .insert({
        state,
        district,
        block: block || null,
        gram_panchayat: gramPanchayat || null,
        village_name: villageName,
        source: "custom_user_entry",
        verification_status: "pending",
      })
      .select("id")
      .single();
    if (v) villageId = v.id;
  }

  const manageToken = newCreatorToken();

  // Unique slug with retries.
  let poll = null;
  for (let attempt = 0; attempt < 5 && !poll; attempt++) {
    const slug = `${baseSlug}-${shortId()}`;
    const { data, error } = await db
      .from("polls")
      .insert({
        slug,
        creator_token_hash: hashToken(manageToken),
        state,
        district,
        block: block || null,
        village_name: villageName,
        village_id: villageId,
        poll_type: pollType,
        ward_number: pollType === "ward_panch" ? wardNumber : null,
        title: villageName,
        status: "active",
        expires_at: expiresAt,
      })
      .select("id, slug")
      .single();
    if (!error) poll = data;
  }
  if (!poll) return bad("Could not create the poll. Please try again.", 500);

  const { error: candError } = await db.from("candidates").insert(
    candidates.map((c, i) => ({ ...c, poll_id: poll.id, position: i }))
  );
  if (candError) {
    await db.from("polls").delete().eq("id", poll.id);
    return bad("Could not save candidates. Please try again.", 500);
  }

  await db.from("poll_events").insert({ poll_id: poll.id, event: "create" });

  return NextResponse.json({
    id: poll.id,
    slug: poll.slug,
    url: `/poll/${poll.slug}`,
    manageToken,
    manageUrl: `/m/${manageToken}`,
  });
}

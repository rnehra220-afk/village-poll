import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/validate";

export const dynamic = "force-dynamic";

function voteSalt() {
  return process.env.VOTE_SALT || process.env.ADMIN_PASSWORD || "dev-only-salt";
}

function isExpired(poll) {
  return poll.expires_at && new Date(poll.expires_at).getTime() < Date.now();
}

/**
 * POST /api/polls/[id]/vote — record one vote.
 * Body: { candidate_id }
 * Anti-abuse: unique (poll_id, voter_hash) constraint + IP rate limits.
 * voter_hash = sha256(poll_id + anonymous session id + server salt).
 */
export async function POST(req, { params }) {
  const ip = getClientIp(req);
  const rl = rateLimit(`vote:${ip}`, { limit: 12, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const candidateId = String(body.candidate_id || "");
  if (!candidateId) return NextResponse.json({ error: "No candidate selected." }, { status: 400 });

  const db = getServiceClient();
  const { data: poll } = await db.from("polls").select("id, status, expires_at").eq("id", params.id).single();
  if (!poll || poll.status === "hidden") {
    return NextResponse.json({ error: "This poll could not be found." }, { status: 404 });
  }
  if (poll.status === "closed" || isExpired(poll)) {
    return NextResponse.json({ error: "This poll has been closed." }, { status: 410 });
  }

  const { data: candidate } = await db
    .from("candidates")
    .select("id")
    .eq("id", candidateId)
    .eq("poll_id", poll.id)
    .single();
  if (!candidate) return NextResponse.json({ error: "Invalid candidate." }, { status: 400 });

  // Anonymous voter session (httpOnly cookie, 1 year).
  const jar = cookies();
  let vpid = jar.get("vpid")?.value;
  let setCookie = false;
  if (!vpid || !/^[0-9a-f-]{20,60}$/i.test(vpid)) {
    vpid = crypto.randomUUID();
    setCookie = true;
  }
  const voterHash = crypto.createHash("sha256").update(`${poll.id}:${vpid}:${voteSalt()}`).digest("hex");
  const ipHash = crypto.createHash("sha256").update(`${ip}:${voteSalt()}`).digest("hex");

  const { error } = await db.from("votes").insert({
    poll_id: poll.id,
    candidate_id: candidate.id,
    voter_hash: voterHash,
    ip_hash: ipHash,
  });

  if (error) {
    // Unique violation => this session/device already voted in this poll.
    if (error.code === "23505") {
      const res = NextResponse.json({ error: "already_voted" }, { status: 409 });
      if (setCookie) {
        res.cookies.set("vpid", vpid, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 31536000 });
      }
      return res;
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await db.from("poll_events").insert({ poll_id: poll.id, event: "vote" });

  const res = NextResponse.json({ ok: true });
  if (setCookie) {
    res.cookies.set("vpid", vpid, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 31536000 });
  }
  return res;
}

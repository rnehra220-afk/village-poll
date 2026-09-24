/**
 * Tiny in-memory rate limiter for API routes.
 * NOTE: on serverless platforms each instance has its own memory, so this
 * is a best-effort first line of defence. The UNIQUE(poll_id, voter_hash)
 * constraint in the database is the real duplicate-vote guarantee.
 */
const buckets = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (now > b.reset) buckets.delete(k);
  }
}, 60_000);

export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now > b.reset) {
    b = { count: 0, reset: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;
  return { ok: b.count <= limit, remaining: Math.max(0, limit - b.count) };
}

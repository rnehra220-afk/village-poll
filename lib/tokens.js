import crypto from "crypto";

/** Creator management tokens (MVP passwordless auth). */
export function newCreatorToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

/** Admin session: HMAC-signed timestamp cookie. */
const ADMIN_COOKIE = "vp_admin";

function adminSecret() {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("Missing ADMIN_PASSWORD env var.");
  return s;
}

export function signAdminSession() {
  const ts = Date.now().toString();
  const sig = crypto.createHmac("sha256", adminSecret()).update(ts).digest("hex");
  return `${ts}.${sig}`;
}

export function verifyAdminSession(value) {
  if (!value || typeof value !== "string") return false;
  const [ts, sig] = value.split(".");
  if (!ts || !sig || !/^\d+$/.test(ts)) return false;
  // 12 hour session
  if (Date.now() - Number(ts) > 12 * 3600 * 1000) return false;
  const expected = crypto.createHmac("sha256", adminSecret()).update(ts).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function adminCookieName() {
  return ADMIN_COOKIE;
}

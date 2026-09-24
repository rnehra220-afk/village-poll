import geoData from "../public/data/geo.json";

export const STATES = geoData.states;

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function shortId(len = 6) {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  const buf = require("crypto").randomBytes(len);
  for (let i = 0; i < len; i++) out += chars[buf[i] % chars.length];
  return out;
}

export function pollTitle({ villageName, pollType, wardNumber }, t) {
  const typeLabel = t(`pollType_${pollType}`) || pollType;
  const ward = pollType === "ward_panch" && wardNumber ? ` ${t("ward")} ${wardNumber}` : "";
  return `${villageName}${ward} ${typeLabel} ${t("opinionPoll")}`;
}

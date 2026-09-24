/**
 * Ad slot configuration.
 *
 * Slots:
 *  A — Homepage top/banner
 *  B — Between poll content and results
 *  C — Below results
 *  D — Sidebar on desktop
 *  E — Mobile sticky banner
 *
 * MVP: renders clearly-labelled placeholder containers so layouts can be
 * designed around real ad sizes (300x250, 320x50, 728x90). To integrate a
 * network later (e.g. Google AdSense), set ADS_ENABLED=true and paste the
 * network's script/tag into AD_NETWORK_SNIPPET below, or replace the
 * placeholder render in components/AdSlot.js with your ad tag component.
 * Never place unvalidated third-party scripts: review any snippet before
 * enabling it in production.
 */

export const ADS_ENABLED = process.env.ADS_ENABLED !== "false";

// Paste your ad-network loader snippet here when ready (reviewed code only).
export const AD_NETWORK_SNIPPET = "";

export const AD_SLOTS = {
  A: { label: "Homepage top banner", sizes: ["728x90", "320x50"], className: "w-full" },
  B: { label: "Poll page: content / results divider", sizes: ["336x280", "300x250"], className: "w-full" },
  C: { label: "Poll page: below results", sizes: ["728x90", "320x50"], className: "w-full" },
  D: { label: "Desktop sidebar", sizes: ["300x250", "300x600"], className: "hidden lg:block w-[300px]" },
  E: { label: "Mobile sticky banner", sizes: ["320x50"], className: "lg:hidden" },
};

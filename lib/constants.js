export const POLL_TYPES = [
  { id: "sarpanch", labelKey: "pollTypeSarpanch", descKey: "pollTypeSarpanchDesc" },
  { id: "ward_panch", labelKey: "pollTypeWardPanch", descKey: "pollTypeWardPanchDesc" },
  { id: "zila_parishad", labelKey: "pollTypeZilaParishad", descKey: "pollTypeZilaParishadDesc" },
];

export const EXPIRY_OPTIONS = [
  { id: "1d", days: 1 },
  { id: "3d", days: 3 },
  { id: "7d", days: 7 },
  { id: "15d", days: 15 },
  { id: "30d", days: 30 },
  { id: "never", days: null },
];

export const REPORT_REASONS = [
  "incorrect_info",
  "impersonation",
  "offensive",
  "spam",
  "duplicate",
  "misleading",
  "other",
];

export const MAX_CANDIDATES = 20;
export const MIN_CANDIDATES = 2;

/** Ad slot placements (config in lib/ads.js). */
export const AD_SLOT_IDS = ["A", "B", "C", "D", "E"];

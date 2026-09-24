"use client";

import { useLang } from "./Providers";

/**
 * Small amber disclaimer box shown on poll pages and the create flow.
 */
export default function DisclaimerBox({ compact = false }) {
  const { t } = useLang();
  if (compact) {
    return (
      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        {t("hero_disclaimer")}
      </p>
    );
  }
  return (
    <div className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-4" role="note">
      <p className="font-semibold mb-1">{t("unofficial")}</p>
      <p>{t("disclaimer_full")}</p>
    </div>
  );
}

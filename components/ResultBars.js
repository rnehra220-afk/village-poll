"use client";

import { useEffect, useState } from "react";
import { useLang } from "./Providers";

/**
 * Animated horizontal result bars.
 * Props: { results: [{candidate_id, name, votes, pct}], total }
 */
export default function ResultBars({ results, total }) {
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!results?.length) return null;

  return (
    <div className="space-y-3" role="list" aria-label={t("poll_results")}>
      {results.map((r, i) => (
        <div key={r.candidate_id} role="listitem" className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span className="font-medium text-slate-900 text-sm">
              <span className="text-slate-400 mr-2">{i + 1}.</span>
              {r.name}
            </span>
            <span className="text-sm font-bold text-brand-700 whitespace-nowrap">
              {r.pct}% <span className="font-normal text-slate-500">({r.votes})</span>
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-1000 ease-out"
              style={{ width: mounted ? `${r.pct}%` : "0%" }}
              aria-hidden
            />
          </div>
        </div>
      ))}
      <p className="text-sm text-slate-500 text-center pt-1">
        {t("poll_totalVotes")}: <strong className="text-slate-800">{total}</strong>
      </p>
    </div>
  );
}

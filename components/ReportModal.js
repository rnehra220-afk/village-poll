"use client";

import { useState } from "react";
import { useLang } from "./Providers";
import { REPORT_REASONS } from "@/lib/constants";

/** Report-a-poll modal. Props: { pollId } */
export default function ReportModal({ pollId }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poll_id: pollId, reason, details }),
      });
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setDone(false); }}
        className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
      >
        {t("poll_report")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={t("report_title")}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            {done ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-2" aria-hidden>✓</p>
                <p className="text-slate-800 font-medium">{t("report_thanks")}</p>
                <button onClick={() => setOpen(false)} className="mt-4 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold min-h-[48px]">
                  {t("close")}
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-slate-900 text-lg">{t("report_title")}</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">{t("report_sub")}</p>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="report-reason">{t("report_reason")}</label>
                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-3 text-sm min-h-[48px] bg-white"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>{t(`reason_${r}`)}</option>
                  ))}
                </select>
                <label className="block text-sm font-medium text-slate-700 mt-3 mb-1" htmlFor="report-details">{t("report_details")}</label>
                <textarea
                  id="report-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={t("report_detailsPh")}
                  rows={3}
                  maxLength={1000}
                  className="w-full border border-slate-300 rounded-xl px-3 py-3 text-sm"
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={submit}
                    disabled={sending}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white min-h-[48px] disabled:opacity-60"
                  >
                    {sending ? t("loading") : t("report_submit")}
                  </button>
                  <button onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 min-h-[48px]">
                    {t("cancel")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { useLang } from "./Providers";

/** Card for trending / recent / search result lists. */
export default function PollCard({ poll }) {
  const { t } = useLang();
  const typeLabel = t(`pollType_${poll.poll_type}`) || poll.poll_type;
  const ward = poll.poll_type === "ward_panch" && poll.ward_number ? ` · ${t("ward")} ${poll.ward_number}` : "";

  return (
    <Link
      href={`/poll/${poll.slug}`}
      className="block bg-white border border-slate-200 rounded-2xl p-4 hover:border-brand-300 hover:shadow-md transition"
    >
      <p className="font-semibold text-slate-900">{poll.village_name}</p>
      <p className="text-sm text-brand-700 font-medium mt-0.5">{typeLabel} {t("opinionPoll")}{ward}</p>
      <p className="text-xs text-slate-500 mt-1">
        {poll.district}, {poll.state}
      </p>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <span><strong className="text-slate-800">{poll.votes ?? 0}</strong> {t("votes")}</span>
        <span><strong className="text-slate-800">{poll.views ?? 0}</strong> {t("poll_views")}</span>
        {poll.status === "closed" && (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{t("status_closed")}</span>
        )}
      </div>
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "./Providers";
import PollCard from "./PollCard";
import AdSlot from "./AdSlot";

function PollGrid({ polls, empty }) {
  if (!polls?.length) {
    return <p className="text-slate-500 text-sm bg-slate-50 border border-slate-200 rounded-xl p-4">{empty}</p>;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {polls.map((p) => (
        <PollCard key={p.id} poll={p} />
      ))}
    </div>
  );
}

/** Trending + recent poll lists (fetched client-side so builds never need DB env). */
export default function HomeLists() {
  const { t } = useLang();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/trending?_t=" + Date.now(), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData({ trending: [], recent: [] }));
  }, []);

  if (!data) {
    return (
      <div className="space-y-10">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-7 w-48 bg-slate-100 rounded mb-4" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-32 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="trending">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 id="trending" className="section-title">{t("trending_title")}</h2>
            <p className="text-slate-500 text-sm mt-1">{t("trending_sub")}</p>
          </div>
          <Link href="/search" className="text-sm font-semibold text-brand-600 hover:underline whitespace-nowrap ml-4">
            {t("search")} →
          </Link>
        </div>
        <PollGrid polls={data.trending} empty={t("trending_empty")} />
      </section>

      <section aria-labelledby="recent">
        <h2 id="recent" className="section-title mb-1">{t("recent_title")}</h2>
        <p className="text-slate-500 text-sm mt-1 mb-4">{t("recent_sub")}</p>
        <PollGrid polls={data.recent} empty={t("recent_empty")} />
      </section>
    </div>
  );
}

export function HeroStats() {
  const { t } = useLang();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch("/api/trending?_t=" + Date.now(), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.stats && setStats(d.stats))
      .catch(() => {});
  }, []);
  if (!stats) return null;
  const items = [
    { v: stats.polls, l: t("stat_polls") },
    { v: stats.votes, l: t("stat_votes") },
  ];
  return (
    <dl className="flex gap-8 mt-8">
      {items.map((s) => (
        <div key={s.l}>
          <dt className="text-3xl font-bold text-slate-900">{Number(s.v).toLocaleString("en-IN")}</dt>
          <dd className="text-sm text-slate-500">{s.l}</dd>
        </div>
      ))}
    </dl>
  );
}

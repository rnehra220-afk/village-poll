"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "./Providers";

/** "My Polls" — polls created on this device (tokens in localStorage). */
export default function MyPollsClient() {
  const { t } = useLang();
  const [polls, setPolls] = useState(null);

  const load = async () => {
    let tokens = [];
    try {
      tokens = (JSON.parse(localStorage.getItem("vp_tokens") || "[]") || []).map((x) => x.token).filter(Boolean);
    } catch {}
    if (!tokens.length) {
      setPolls([]);
      return;
    }
    try {
      const r = await fetch("/api/my-polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens }),
      });
      const d = await r.json();
      setPolls(d.polls || []);
    } catch {
      setPolls([]);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (p, action) => {
    const confirmMsg = action === "delete" ? t("my_confirmDelete") : t("my_confirmClose");
    if (!confirm(confirmMsg)) return;
    const method = action === "delete" ? "DELETE" : "PATCH";
    await fetch(`/api/polls/${p.id}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.manageToken}` },
      body: method === "PATCH" ? JSON.stringify({ action: p.status === "active" ? "close" : "reopen" }) : undefined,
    });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="section-title">{t("my_title")}</h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">{t("my_sub")}</p>

      {polls === null && <p className="text-slate-500 text-sm">{t("loading")}</p>}

      {polls && polls.length === 0 && (
        <div className="card p-8 text-center">
          <p className="font-semibold text-slate-900">{t("my_empty")}</p>
          <p className="text-sm text-slate-500 mt-1 mb-4">{t("my_emptyMsg")}</p>
          <Link href="/create" className="btn-primary">{t("nav_create")}</Link>
        </div>
      )}

      {polls && polls.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {polls.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{p.village_name}</p>
                  <p className="text-sm text-brand-700 font-medium">{t(`pollType_${p.poll_type}`)} {t("opinionPoll")}</p>
                  <p className="text-xs text-slate-500 mt-1">{p.district}, {p.state}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                  {t(`status_${p.status}`)}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-slate-500 mt-3">
                <span><strong className="text-slate-800">{p.votes}</strong> {t("votes")}</span>
                <span><strong className="text-slate-800">{p.views}</strong> {t("poll_views")}</span>
                <span><strong className="text-slate-800">{p.shares}</strong> {t("shares")}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link href={`/poll/${p.slug}`} className="text-sm font-semibold text-brand-600 hover:underline min-h-[44px] flex items-center">
                  {t("viewPoll")}
                </Link>
                {p.manageToken && (
                  <Link href={`/m/${p.manageToken}`} className="text-sm font-semibold text-slate-600 hover:underline min-h-[44px] flex items-center">
                    {t("my_manage")}
                  </Link>
                )}
                <button onClick={() => act(p, "close")} className="text-sm font-medium text-amber-700 hover:underline min-h-[44px]">
                  {p.status === "active" ? t("my_close") : t("status_active")}
                </button>
                <button onClick={() => act(p, "delete")} className="text-sm font-medium text-red-600 hover:underline min-h-[44px]">
                  {t("my_delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

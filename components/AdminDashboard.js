"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/Providers";

function useAdminApi(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    setLoading(true);
    try {
      const r = await fetch(path);
      setData(r.ok ? await r.json() : null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { reload(); }, deps);
  return { data, loading, reload };
}

export default function AdminDashboard() {
  const { t } = useLang();
  const [tab, setTab] = useState("overview");

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const tabs = [
    ["overview", t("admin_tabOverview")],
    ["polls", t("admin_tabPolls")],
    ["reports", t("admin_tabReports")],
    ["villages", t("admin_tabVillages")],
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">{t("admin_title")}</h1>
        <button onClick={logout} className="text-sm font-semibold text-slate-600 hover:underline min-h-[44px] px-2">
          {t("admin_logout")}
        </button>
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto" role="tablist">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`px-4 py-3 text-sm font-semibold min-h-[48px] whitespace-nowrap border-b-2 -mb-px ${
              tab === id ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "polls" && <PollsTab />}
      {tab === "reports" && <ReportsTab />}
      {tab === "villages" && <VillagesTab />}
    </div>
  );
}

function Stat({ v, l }) {
  return (
    <div className="card p-5">
      <p className="text-3xl font-bold text-slate-900">{Number(v || 0).toLocaleString("en-IN")}</p>
      <p className="text-sm text-slate-500 mt-1">{l}</p>
    </div>
  );
}

function OverviewTab() {
  const { t } = useLang();
  const { data } = useAdminApi("/api/admin/overview");
  if (!data) return <p className="text-sm text-slate-500">{t("loading")}</p>;
  const days = Object.entries(data.votesPerDay || {}).sort().slice(-14);
  const max = Math.max(1, ...days.map(([, v]) => v));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat v={data.polls} l={t("admin_mPolls")} />
        <Stat v={data.activePolls} l={t("admin_mActive")} />
        <Stat v={data.votes} l={t("admin_mVotes")} />
        <Stat v={data.villages} l={t("admin_mVillages")} />
        <Stat v={data.openReports} l={t("admin_mReports")} />
      </div>
      <div className="card p-5">
        <p className="font-semibold text-slate-900 mb-4">{t("admin_mVotes")} — {t("admin_tabOverview")}</p>
        <div className="flex items-end gap-1 h-32">
          {days.map(([d, v]) => (
            <div key={d} className="flex-1 flex flex-col items-center gap-1" title={`${d}: ${v}`}>
              <div className="w-full bg-brand-200 rounded-t" style={{ height: `${Math.max(4, (v / max) * 110)}px` }} />
              <span className="text-[9px] text-slate-400">{d.slice(5)}</span>
            </div>
          ))}
          {!days.length && <p className="text-sm text-slate-500">{t("admin_noData")}</p>}
        </div>
      </div>
    </div>
  );
}

function PollsTab() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const { data, loading, reload } = useAdminApi(`/api/admin/polls?q=${encodeURIComponent(query)}`, [query]);
  const polls = data?.polls || [];

  const act = async (id, action) => {
    if (action === "delete" && !confirm(t("admin_confirmDelete"))) return;
    await fetch("/api/admin/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    reload();
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setQuery(q)} placeholder={t("search_ph")} aria-label={t("search")} />
        <button onClick={() => setQuery(q)} className="btn-secondary !py-2 whitespace-nowrap">{t("search")}</button>
      </div>
      <div className="space-y-2">
        {polls.map((p) => (
          <div key={p.id} className="card p-4 flex flex-wrap items-center gap-2 justify-between">
            <div className="min-w-0">
              <p className="font-medium text-slate-900 truncate">{p.village_name} <span className="text-slate-400 font-normal">· {t(`pollType_${p.poll_type}`)}</span></p>
              <p className="text-xs text-slate-500">{p.district}, {p.state} · {p.status} · {p.views} views</p>
            </div>
            <div className="flex flex-wrap gap-1">
              <Link href={`/poll/${p.slug}`} target="_blank" className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 min-h-[40px] flex items-center">{t("admin_action_view")}</Link>
              {p.status === "hidden" ? (
                <button onClick={() => act(p.id, "restore")} className="px-3 py-2 text-xs font-semibold rounded-lg bg-green-100 text-green-800 hover:bg-green-200 min-h-[40px]">{t("admin_action_restore")}</button>
              ) : (
                <button onClick={() => act(p.id, "hide")} className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 min-h-[40px]">{t("admin_action_hide")}</button>
              )}
              {p.status === "active" ? (
                <button onClick={() => act(p.id, "close")} className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 min-h-[40px]">{t("admin_action_close")}</button>
              ) : p.status === "closed" ? (
                <button onClick={() => act(p.id, "reopen")} className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 min-h-[40px]">{t("status_active")}</button>
              ) : null}
              <button onClick={() => act(p.id, "delete")} className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 min-h-[40px]">{t("admin_action_delete")}</button>
            </div>
          </div>
        ))}
        {!polls.length && <p className="text-sm text-slate-500">{t("admin_noData")}</p>}
      </div>
    </div>
  );
}

function ReportsTab() {
  const { t } = useLang();
  const { data, reload } = useAdminApi("/api/admin/reports");
  const reports = data?.reports || [];

  const act = async (id, action) => {
    await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    reload();
  };

  return (
    <div className="space-y-2">
      {reports.map((r) => (
        <div key={r.id} className="card p-4">
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">{t(`reason_${r.reason}`) || r.reason}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {r.polls ? `${r.polls.village_name}, ${r.polls.district}, ${r.polls.state}` : ""} · {new Date(r.created_at).toLocaleDateString()}
              </p>
              {r.details && <p className="text-sm text-slate-600 mt-2">{r.details}</p>}
            </div>
            <div className="flex gap-1 items-start">
              {r.polls && (
                <Link href={`/poll/${r.polls.slug}`} target="_blank" className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 min-h-[40px] flex items-center">{t("admin_action_view")}</Link>
              )}
              <button onClick={() => act(r.id, "dismissed")} className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 min-h-[40px]">{t("admin_action_dismiss")}</button>
            </div>
          </div>
        </div>
      ))}
      {!reports.length && <p className="text-sm text-slate-500">{t("admin_noData")}</p>}
    </div>
  );
}

function VillagesTab() {
  const { t } = useLang();
  const [status, setStatus] = useState("pending");
  const { data, reload } = useAdminApi(`/api/admin/villages?status=${status}`, [status]);
  const villages = data?.villages || [];

  const act = async (id, action) => {
    await fetch("/api/admin/villages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    reload();
  };

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {["pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg min-h-[44px] ${status === s ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            {t(`admin_villageStatus_${s}`)}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {villages.map((v) => (
          <div key={v.id} className="card p-4 flex flex-wrap justify-between gap-2 items-center">
            <div>
              <p className="font-medium text-slate-900">{v.village_name}</p>
              <p className="text-xs text-slate-500">
                {v.block ? `${v.block}, ` : ""}{v.district}, {v.state} · {t("admin_source")}: {v.source}
              </p>
            </div>
            {status === "pending" && (
              <div className="flex gap-1">
                <button onClick={() => act(v.id, "approved")} className="px-3 py-2 text-xs font-semibold rounded-lg bg-green-100 text-green-800 hover:bg-green-200 min-h-[40px]">{t("admin_action_approve")}</button>
                <button onClick={() => act(v.id, "rejected")} className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 min-h-[40px]">{t("admin_action_reject")}</button>
              </div>
            )}
          </div>
        ))}
        {!villages.length && <p className="text-sm text-slate-500">{t("admin_noData")}</p>}
      </div>
    </div>
  );
}

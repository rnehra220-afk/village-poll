"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/Providers";
import ShareButtons from "@/components/ShareButtons";

/** Private creator management page. Props: { token } */
export default function ManageClient({ token }) {
  const { t } = useLang();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  const load = async () => {
    try {
      const r = await fetch(`/api/manage/${token}`);
      if (!r.ok) throw new Error();
      setData(await r.json());
    } catch {
      setFailed(true);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (action) => {
    const msg = action === "delete" ? t("my_confirmDelete") : t("my_confirmClose");
    if (!confirm(msg)) return;
    const method = action === "delete" ? "DELETE" : "PATCH";
    const res = await fetch(`/api/polls/${data.poll.id}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: method === "PATCH" ? JSON.stringify({ action: data.poll.status === "active" ? "close" : "reopen" }) : undefined,
    });
    if (res.ok && action === "delete") {
      window.location.href = "/my-polls";
      return;
    }
    load();
  };

  if (failed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="font-semibold text-slate-900">{t("manage_invalid")}</p>
        <Link href="/" className="btn-secondary mt-4">{t("nav_home")}</Link>
      </div>
    );
  }
  if (!data) return <div className="max-w-xl mx-auto px-4 py-16 text-slate-500 text-sm">{t("loading")}</div>;

  const { poll } = data;
  const pollUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/poll/${poll.slug}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <p className="text-xs uppercase tracking-widest text-brand-700 font-semibold">{t("manage_title")}</p>
      <h1 className="text-2xl font-bold text-slate-900 mt-1">{poll.village_name} — {t(`pollType_${poll.poll_type}`)} {t("opinionPoll")}</h1>
      <p className="text-sm text-slate-500 mt-1">{poll.district}, {poll.state}</p>

      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          [poll.votes, t("votes")],
          [poll.views, t("poll_views")],
          [poll.shares, t("shares")],
        ].map(([v, l]) => (
          <div key={l} className="card p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{v}</p>
            <p className="text-xs text-slate-500">{l}</p>
          </div>
        ))}
      </div>

      <div className="card p-5 mt-4">
        <p className="text-sm text-slate-600">
          {t("manage_stats")}:{" "}
          <strong>{t(`status_${poll.status}`)}</strong>
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link href={`/poll/${poll.slug}`} className="btn-secondary !py-2.5 !min-h-[48px] text-sm">{t("viewPoll")}</Link>
          <button onClick={() => act("close")} className="btn-secondary !py-2.5 !min-h-[48px] text-sm">
            {poll.status === "active" ? t("my_close") : t("status_active")}
          </button>
          <button onClick={() => act("delete")} className="!py-2.5 !min-h-[48px] text-sm px-4 rounded-xl bg-red-50 text-red-700 font-semibold hover:bg-red-100">
            {t("my_delete")}
          </button>
        </div>
      </div>

      <div className="card p-5 mt-4">
        <p className="font-semibold text-slate-900 mb-3">{t("poll_shareTitle")}</p>
        <ShareButtons url={pollUrl} title={`${poll.village_name} ${t(`pollType_${poll.poll_type}`)}`} pollId={poll.id} />
      </div>
    </div>
  );
}

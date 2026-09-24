"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "./Providers";
import ResultBars from "./ResultBars";
import ShareButtons from "./ShareButtons";
import QRCodeModal from "./QRCodeModal";
import ReportModal from "./ReportModal";
import DisclaimerBox from "./DisclaimerBox";
import AdSlot from "./AdSlot";

/**
 * Public poll page: voting, live results, share, report.
 * Props: { poll, candidates, pollUrl }
 */
export default function PollView({ poll, candidates, pollUrl }) {
  const { t } = useLang();
  const [selected, setSelected] = useState("");
  const [results, setResults] = useState(null);
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [justVoted, setJustVoted] = useState(false);
  const tracked = useRef(false);

  const closed = poll.status === "closed" || poll.isExpired;

  const fetchResults = () => {
    fetch(`/api/polls/${poll.id}/results`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setResults(d))
      .catch(() => {});
  };

  useEffect(() => {
    try {
      if (localStorage.getItem(`voted_${poll.id}`) === "1") setVoted(true);
    } catch {}
    fetchResults();
    const iv = setInterval(fetchResults, 20000);
    if (!tracked.current) {
      tracked.current = true;
      fetch(`/api/polls/${poll.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "view" }),
      }).catch(() => {});
    }
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vote = async () => {
    if (!selected || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: selected }),
      });
      if (res.status === 409) {
        setVoted(true);
        try { localStorage.setItem(`voted_${poll.id}`, "1"); } catch {}
        fetchResults();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("errorGeneric"));
      setVoted(true);
      setJustVoted(true);
      try { localStorage.setItem(`voted_${poll.id}`, "1"); } catch {}
      fetchResults();
    } catch (e) {
      alert(e.message);
    } finally {
      setVoting(false);
    }
  };

  const typeLabel = `${t(`pollType_${poll.poll_type}`)} ${t("opinionPoll")}`;
  const ward = poll.poll_type === "ward_panch" && poll.ward_number ? ` ${t("ward")} ${poll.ward_number}` : "";
  const title = `${poll.village_name}${ward} ${typeLabel}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-brand-700 font-semibold">{t("unofficial")}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {[poll.village_name, poll.district, poll.state].filter(Boolean).join(", ")}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {poll.expires_at && !poll.isExpired
              ? t("poll_expiresIn", { n: Math.max(1, Math.ceil((new Date(poll.expires_at) - Date.now()) / 86400000)) })
              : t("poll_noExpiry")}
            {" · "}{poll.views} {t("poll_views")}
          </p>

          <div className="mt-4"><DisclaimerBox compact /></div>

          {/* Voting card */}
          <section className="card p-5 mt-4" aria-labelledby="vote-h">
            {closed ? (
              <div className="text-center py-2">
                <p className="font-bold text-lg text-slate-900">{t("poll_closed")}</p>
                <p className="text-sm text-slate-500 mt-1">{t("poll_closedMsg")}</p>
              </div>
            ) : voted ? (
              <div className="text-center py-2">
                <p className="text-3xl mb-1" aria-hidden>✓</p>
                <p className="font-bold text-lg text-slate-900">{justVoted ? t("poll_thanks") : t("poll_alreadyVoted")}</p>
                {justVoted && <p className="text-sm text-slate-500 mt-1">{t("poll_thanksMsg")}</p>}
              </div>
            ) : (
              <>
                <h2 id="vote-h" className="font-semibold text-slate-900">{t("poll_voteQ")}</h2>
                <div className="space-y-2 mt-4" role="radiogroup" aria-label={t("poll_voteQ")}>
                  {candidates.map((c) => (
                    <button
                      key={c.id}
                      role="radio"
                      aria-checked={selected === c.id}
                      onClick={() => setSelected(c.id)}
                      className={`w-full text-left border rounded-xl px-4 py-3.5 min-h-[56px] transition flex items-center gap-3 ${
                        selected === c.id
                          ? "border-brand-600 ring-2 ring-brand-200 bg-brand-50"
                          : "border-slate-200 hover:border-brand-300 bg-white"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected === c.id ? "border-brand-600" : "border-slate-300"}`}
                        aria-hidden
                      >
                        {selected === c.id && <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                      </span>
                      <span>
                        <span className="block font-medium text-slate-900 text-sm">{c.name}</span>
                        {c.description && <span className="block text-xs text-slate-500 mt-0.5">{c.description}</span>}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={vote}
                  disabled={!selected || voting}
                  className="btn-primary w-full mt-4 disabled:opacity-50"
                >
                  {voting ? t("poll_voting") : t("poll_submitVote")}
                </button>
              </>
            )}
          </section>

          <AdSlot id="B" />

          {/* Results */}
          <section className="mt-6" aria-labelledby="res-h">
            <h2 id="res-h" className="section-title !text-xl mb-3">{t("poll_results")}</h2>
            {results ? (
              results.total > 0 ? (
                <ResultBars results={results.results} total={results.total} />
              ) : (
                <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">{t("poll_noVotes")}</p>
              )
            ) : (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
              </div>
            )}
          </section>

          <AdSlot id="C" />

          {/* Share */}
          <section className="card p-5 mt-6" aria-labelledby="share-h">
            <h2 id="share-h" className="font-bold text-lg">{t("poll_shareTitle")}</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">{t("poll_shareMsg")}</p>
            <ShareButtons url={pollUrl} title={title} pollId={poll.id} />
            <div className="mt-3"><QRCodeModal url={pollUrl} title={title} /></div>
          </section>

          <div className="mt-6"><DisclaimerBox /></div>
          <div className="mt-4 text-center"><ReportModal pollId={poll.id} /></div>
        </div>

        <aside className="mt-8 lg:mt-0">
          <AdSlot id="D" />
        </aside>
      </div>
      <AdSlot id="E" />
    </div>
  );
}

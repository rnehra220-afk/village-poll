"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "./Providers";
import { STATES } from "@/lib/geo";
import PollCard from "./PollCard";

const TYPES = ["all", "sarpanch", "ward_panch", "zila_parishad"];

export default function SearchClient() {
  const { t } = useLang();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [state, setState] = useState("all");
  const [district, setDistrict] = useState("");
  const [type, setType] = useState("all");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async (overrides = {}) => {
    setLoading(true);
    const p = new URLSearchParams({
      q: overrides.q ?? q,
      state: overrides.state ?? state,
      district: overrides.district ?? district,
      type: overrides.type ?? type,
    });
    try {
      const r = await fetch(`/api/search?${p.toString()}`);
      const d = await r.json();
      setResults(d.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = params.get("q");
    if (initial) run({ q: initial });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="section-title text-center">{t("search_title")}</h1>
      <p className="text-slate-500 text-center mt-1 mb-6">{t("search_sub")}</p>

      <div className="card p-5 space-y-3">
        <div className="flex gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder={t("search_ph")}
            aria-label={t("search")}
          />
          <button onClick={() => run()} className="btn-primary whitespace-nowrap !px-5">{t("search")}</button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="s-state">{t("search_state")}</label>
            <select id="s-state" value={state} onChange={(e) => { setState(e.target.value); }}>
              <option value="all">{t("search_allStates")}</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="s-district">{t("search_district")}</label>
            <input id="s-district" type="text" value={district} onChange={(e) => setDistrict(e.target.value)} />
          </div>
          <div>
            <label htmlFor="s-type">{t("search_type")}</label>
            <select id="s-type" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((x) => (
                <option key={x} value={x}>{x === "all" ? t("search_allTypes") : `${t(`pollType_${x}`)} ${t("opinionPoll")}`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading && <p className="text-slate-500 text-sm">{t("loading")}</p>}
        {!loading && results && (
          results.length ? (
            <>
              <p className="text-sm text-slate-500 mb-3">{t("search_resultsFor")}: <strong className="text-slate-800">{results.length}</strong></p>
              <div className="grid gap-3 sm:grid-cols-2">
                {results.map((p) => <PollCard key={p.id} poll={p} />)}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">{t("search_noResults")}</p>
          )
        )}
      </div>
    </div>
  );
}

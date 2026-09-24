"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "./Providers";
import { STATES } from "@/lib/geo";
import { EXPIRY_OPTIONS, MAX_CANDIDATES } from "@/lib/constants";
import ShareButtons from "./ShareButtons";
import QRCodeModal from "./QRCodeModal";
import DisclaimerBox from "./DisclaimerBox";

const emptyCandidate = () => ({ name: "", photo_url: "", description: "" });

export default function CreateWizard() {
  const { t } = useLang();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [villageName, setVillageName] = useState("");
  const [gramPanchayat, setGramPanchayat] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const [pollType, setPollType] = useState("");
  const [wardNumber, setWardNumber] = useState("");
  const [candidates, setCandidates] = useState([emptyCandidate(), emptyCandidate()]);
  const [expiry, setExpiry] = useState("30d");

  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState(null);

  const fail = (msg) => {
    setError(msg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateStep = (s) => {
    if (s === 1) {
      if (!state) return t("err_stateRequired");
      if (!district.trim()) return t("err_districtRequired");
      if (!villageName.trim()) return t("err_villageRequired");
    }
    if (s === 2 && !pollType) return t("step2t");
    if (s === 3) {
      if (pollType === "ward_panch" && !wardNumber.trim()) return t("err_wardRequired");
      const filled = candidates.filter((c) => c.name.trim());
      if (filled.length < 2) return t("err_candidatesMin");
      if (candidates.some((c) => !c.name.trim())) return t("err_candidateName");
    }
    return "";
  };

  const goNext = () => {
    const msg = validateStep(step);
    if (msg) return fail(msg);
    setError("");
    setStep(step + 1);
    window.scrollTo({ top: 0 });
  };

  const updateCandidate = (i, field, value) => {
    setCandidates(candidates.map((c, j) => (j === i ? { ...c, [field]: value } : c)));
  };

  const publish = async () => {
    setPublishing(true);
    setError("");
    try {
      const exp = EXPIRY_OPTIONS.find((o) => o.id === expiry);
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          district: district.trim(),
          block: block.trim(),
          villageName: villageName.trim(),
          gramPanchayat: gramPanchayat.trim(),
          pollType,
          wardNumber: wardNumber.trim(),
          candidates: candidates.filter((c) => c.name.trim()).map((c) => ({
            name: c.name.trim(),
            photo_url: c.photo_url.trim(),
            description: c.description.trim(),
          })),
          expiresInDays: exp ? exp.days : null,
          hp: "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("errorGeneric"));

      // Save to "My Polls" on this device.
      try {
        const saved = JSON.parse(localStorage.getItem("vp_tokens") || "[]");
        saved.unshift({ token: data.manageToken, slug: data.slug, at: Date.now() });
        localStorage.setItem("vp_tokens", JSON.stringify(saved.slice(0, 50)));
      } catch {}

      setResult(data);
      setStep(5);
      window.scrollTo({ top: 0 });
    } catch (e) {
      fail(e.message);
    } finally {
      setPublishing(false);
    }
  };

  const typeCards = ["sarpanch", "ward_panch", "zila_parishad"];
  const previewTitle = villageName
    ? `${villageName}${pollType === "ward_panch" && wardNumber ? ` ${t("ward")} ${wardNumber}` : ""} ${pollType ? t(`pollType_${pollType}`) : ""} ${t("opinionPoll")}`
    : "";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="section-title text-center">{t("create_title")}</h1>
      <p className="text-slate-500 text-center mt-1 mb-6">{t("create_sub")}</p>

      {step < 5 && (
        <ol className="flex items-center gap-1 mb-8" aria-label="Progress">
          {[1, 2, 3, 4].map((s) => (
            <li key={s} className="flex-1">
              <div className={`h-2 rounded-full ${s <= step ? "bg-brand-600" : "bg-slate-200"}`} />
              <p className={`text-[11px] mt-1 text-center ${s === step ? "font-semibold text-brand-700" : "text-slate-400"}`}>
                {t("step")} {s}
              </p>
            </li>
          ))}
        </ol>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl p-3 mb-4" role="alert">
          {error}
        </div>
      )}

      {/* STEP 1 — location */}
      {step === 1 && (
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-lg">{t("step1t")}</h2>

          <div>
            <label htmlFor="f-state">{t("f_state")}</label>
            <select id="f-state" value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">{t("f_statePh")}</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="f-district">{t("f_district")}</label>
            <input
              id="f-district"
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={t("f_districtPh")}
              autoComplete="off"
            />
            <p className="text-xs text-slate-500 mt-1">{t("f_districtHelp")}</p>
          </div>

          <div>
            <label htmlFor="f-block">{t("f_block")} <span className="text-slate-400">{t("f_blockOptional")}</span></label>
            <input id="f-block" type="text" value={block} onChange={(e) => setBlock(e.target.value)} autoComplete="off" />
          </div>

          <div>
            <label htmlFor="f-village">{t("f_village")}</label>
            <input
              id="f-village"
              type="text"
              value={villageName}
              onChange={(e) => setVillageName(e.target.value)}
              placeholder={t("f_villagePh")}
              autoComplete="off"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-600">{t("cantFind")}</p>
            <button
              type="button"
              onClick={() => setShowCustom(!showCustom)}
              className="mt-2 text-sm font-semibold text-brand-600 hover:underline min-h-[44px]"
            >
              {t("enterManually")}
            </button>
            {showCustom && (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-slate-500">{t("customNote")}</p>
                <div>
                  <label htmlFor="f-gp">{t("f_gramPanchayat")}</label>
                  <input id="f-gp" type="text" value={gramPanchayat} onChange={(e) => setGramPanchayat(e.target.value)} autoComplete="off" />
                </div>
              </div>
            )}
          </div>

          <button onClick={goNext} className="btn-primary w-full">{t("next")}</button>
        </div>
      )}

      {/* STEP 2 — poll type */}
      {step === 2 && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg">{t("step2t")}</h2>
          {typeCards.map((id) => (
            <button
              key={id}
              onClick={() => setPollType(id)}
              className={`w-full text-left card p-5 transition min-h-[72px] ${pollType === id ? "border-brand-600 ring-2 ring-brand-200" : "hover:border-brand-300"}`}
              aria-pressed={pollType === id}
            >
              <span className="font-semibold text-slate-900">{t(`pollType_${id}`)} {t("opinionPoll")}</span>
              <span className="block text-sm text-slate-500 mt-1">{t(`pollType_${id}Desc`)}</span>
            </button>
          ))}
          <div className="flex gap-2 pt-2">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">{t("back")}</button>
            <button onClick={goNext} className="btn-primary flex-1">{t("next")}</button>
          </div>
        </div>
      )}

      {/* STEP 3 — candidates */}
      {step === 3 && (
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="font-bold text-lg">{t("step3t")}</h2>
            <p className="text-sm text-slate-500">{t("step3d")}</p>
          </div>

          {pollType === "ward_panch" && (
            <div>
              <label htmlFor="f-ward">{t("f_wardNumber")}</label>
              <input
                id="f-ward"
                type="text"
                inputMode="numeric"
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                placeholder={t("f_wardNumberPh")}
              />
            </div>
          )}

          {candidates.map((c, i) => (
            <fieldset key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <legend className="text-sm font-semibold text-slate-700 px-1">{t("candidate")} {i + 1}</legend>
              <div>
                <label htmlFor={`cn-${i}`}>{t("f_candName")} *</label>
                <input
                  id={`cn-${i}`}
                  type="text"
                  value={c.name}
                  onChange={(e) => updateCandidate(i, "name", e.target.value)}
                  placeholder={t("f_candNamePh")}
                  maxLength={100}
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor={`cp-${i}`}>{t("f_candPhoto")}</label>
                <input
                  id={`cp-${i}`}
                  type="url"
                  inputMode="url"
                  value={c.photo_url}
                  onChange={(e) => updateCandidate(i, "photo_url", e.target.value)}
                  placeholder="https://…"
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor={`cd-${i}`}>{t("f_candDesc")}</label>
                <input
                  id={`cd-${i}`}
                  type="text"
                  value={c.description}
                  onChange={(e) => updateCandidate(i, "description", e.target.value)}
                  maxLength={300}
                  autoComplete="off"
                />
              </div>
              {candidates.length > 2 && (
                <button
                  type="button"
                  onClick={() => setCandidates(candidates.filter((_, j) => j !== i))}
                  className="text-sm text-red-600 hover:underline min-h-[44px]"
                >
                  {t("removeCandidate")}
                </button>
              )}
            </fieldset>
          ))}

          {candidates.length < MAX_CANDIDATES && (
            <button
              type="button"
              onClick={() => setCandidates([...candidates, emptyCandidate()])}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-600 hover:border-brand-400 hover:text-brand-700 min-h-[52px]"
            >
              {t("addCandidate")}
            </button>
          )}

          <div>
            <label htmlFor="f-expiry">{t("f_expiry")}</label>
            <select id="f-expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)}>
              {EXPIRY_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.days ? t("expiry_days", { n: o.days }) : t("expiry_never")}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">{t("back")}</button>
            <button onClick={goNext} className="btn-primary flex-1">{t("next")}</button>
          </div>
        </div>
      )}

      {/* STEP 4 — preview */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h2 className="font-bold text-lg">{t("step4t")}</h2>
            <p className="text-sm text-slate-500">{t("step4d")}</p>
          </div>

          <div className="card p-5">
            <p className="text-xs uppercase tracking-widest text-brand-700 font-semibold">{t("unofficial")}</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{previewTitle}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {[villageName, district, state].filter(Boolean).join(", ")}
            </p>
            <p className="font-medium text-slate-800 mt-4 mb-2">{t("poll_voteQ")}</p>
            <div className="space-y-2">
              {candidates.filter((c) => c.name.trim()).map((c, i) => (
                <div key={i} className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium min-h-[52px] flex items-center">
                  {c.name}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <DisclaimerBox compact />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="btn-secondary flex-1">{t("editPoll")}</button>
            <button onClick={publish} disabled={publishing} className="btn-primary flex-1 disabled:opacity-60">
              {publishing ? t("publishing") : t("publish")}
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {step === 5 && result && (
        <SuccessView result={result} />
      )}
    </div>
  );
}

function SuccessView({ result }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [copiedManage, setCopiedManage] = useState(false);

  const pollUrl = (typeof window !== "undefined" ? window.location.origin : "") + result.url;
  const manageUrl = (typeof window !== "undefined" ? window.location.origin : "") + result.manageUrl;

  const copyText = async (text, setFn) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="card p-6 text-center">
        <p className="text-4xl mb-2" aria-hidden>🎉</p>
        <h2 className="font-bold text-xl text-slate-900">{t("success_title")}</h2>
        <p className="text-sm text-slate-500 mt-1">{t("success_msg")}</p>
      </div>

      <div className="card p-5">
        <label>{t("yourPollLink")}</label>
        <div className="flex gap-2">
          <input type="text" readOnly value={pollUrl} onFocus={(e) => e.target.select()} aria-label={t("yourPollLink")} />
          <button onClick={() => copyText(pollUrl, setCopied)} className="btn-secondary whitespace-nowrap !px-4">
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link href={result.url} className="btn-primary flex-1">{t("openPoll")}</Link>
          <QRCodeModal url={pollUrl} title={t("success_title")} />
        </div>
        <div className="mt-4">
          <ShareButtons url={pollUrl} title={t("success_title")} pollId={result.id} />
        </div>
      </div>

      <div className="card p-5 border-amber-200 bg-amber-50/50">
        <h3 className="font-semibold text-slate-900">{t("manageTitle")}</h3>
        <p className="text-sm text-slate-600 mt-1">{t("manageMsg")}</p>
        <div className="flex gap-2 mt-3">
          <input type="text" readOnly value={manageUrl} onFocus={(e) => e.target.select()} aria-label={t("manageTitle")} />
          <button onClick={() => copyText(manageUrl, setCopiedManage)} className="btn-secondary whitespace-nowrap !px-4">
            {copiedManage ? t("copied") : t("copy")}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">{t("savedToMyPolls")}</p>
      </div>

      <Link href="/create" onClick={() => window.location.reload()} className="btn-secondary w-full">
        {t("createAnother")}
      </Link>
    </div>
  );
}

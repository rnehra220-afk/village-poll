import { cookies } from "next/headers";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { siteUrl } from "@/lib/supabase";
import HomeLists, { HeroStats } from "@/components/HomeClient";
import AdSlot from "@/components/AdSlot";
import DisclaimerBox from "@/components/DisclaimerBox";

export const metadata = {
  title: "Village Poll — Unofficial Village Opinion Polls",
  description:
    "Create and share unofficial public opinion polls for Sarpanch, Ward Panch and Zila Parishad positions in your village. Free, fast and mobile-first.",
  alternates: { canonical: siteUrl() },
};

function getT() {
  const lang = cookies().get("lang")?.value === "hi" ? "hi" : "en";
  return getDict(lang).t;
}

const STEPS = ["how_s1t", "how_s2t", "how_s3t", "how_s4t", "how_s5t", "how_s6t"];
const FAQS = [["faq_q1", "faq_a1"], ["faq_q2", "faq_a2"], ["faq_q3", "faq_a3"], ["faq_q4", "faq_a4"], ["faq_q5", "faq_a5"]];

export default function Home() {
  const t = getT();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(([q, a]) => ({
      "@type": "Question",
      name: t(q),
      acceptedAnswer: { "@type": "Answer", text: t(a) },
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 text-center">
          <p className="inline-block text-xs font-semibold uppercase tracking-widest text-brand-700 bg-brand-100 rounded-full px-3 py-1 mb-4">
            {t("unofficial")}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 max-w-3xl mx-auto leading-tight">
            {t("hero_title")}
          </h1>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto md:text-lg">{t("hero_sub")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/create" className="btn-primary">{t("hero_ctaCreate")}</Link>
            <Link href="/search" className="btn-secondary">{t("hero_ctaFind")}</Link>
          </div>
          <p className="text-xs text-slate-500 mt-4 max-w-xl mx-auto">{t("hero_disclaimer")}</p>
          <HeroStats />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <AdSlot id="A" />

        {/* Trending + Recent (client-fetched) */}
        <div className="py-10">
          <HomeLists />
        </div>

        {/* How it works */}
        <section className="py-10" aria-labelledby="how">
          <h2 id="how" className="section-title text-center">{t("how_title")}</h2>
          <p className="text-slate-500 text-center mt-1 mb-8">{t("how_sub")}</p>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((k, i) => (
              <li key={k} className="card p-5">
                <span className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mb-3" aria-hidden>
                  {i + 1}
                </span>
                <h3 className="font-semibold text-slate-900">{t(k)}</h3>
                <p className="text-sm text-slate-600 mt-1">{t(k.replace("t", "d"))}</p>
              </li>
            ))}
          </ol>
          <div className="text-center mt-8">
            <Link href="/create" className="btn-primary">{t("hero_ctaCreate")}</Link>
          </div>
        </section>

        {/* What is */}
        <section className="py-10 max-w-3xl mx-auto" aria-labelledby="whatis">
          <h2 id="whatis" className="section-title mb-4">{t("whatIs_title")}</h2>
          <div className="prose-sm text-slate-600 space-y-3">
            <p>{t("whatIs_b1")}</p>
            <p>{t("whatIs_b2")}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-10 max-w-3xl mx-auto" aria-labelledby="faq">
          <h2 id="faq" className="section-title mb-6">{t("faq_title")}</h2>
          <div className="space-y-3">
            {FAQS.map(([q, a]) => (
              <details key={q} className="card p-4 group">
                <summary className="font-medium text-slate-900 cursor-pointer list-none flex justify-between items-center min-h-[44px]">
                  {t(q)}
                  <span className="text-brand-600 ml-2 group-open:rotate-45 transition text-xl leading-none" aria-hidden>+</span>
                </summary>
                <p className="text-sm text-slate-600 mt-2">{t(a)}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="py-6 max-w-3xl mx-auto">
          <DisclaimerBox />
        </div>
      </div>
    </div>
  );
}

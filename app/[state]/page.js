import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getAnonClient, siteUrl } from "@/lib/supabase";
import { STATES, slugify } from "@/lib/geo";
import PollCard from "@/components/PollCard";

function findState(slug) {
  return STATES.find((s) => slugify(s) === slug) || null;
}

async function getStateData(state) {
  try {
    const db = getAnonClient();
    const { data: polls } = await db
      .from("polls")
      .select("id, slug, village_name, district, state, poll_type, ward_number, status, views, created_at")
      .eq("state", state)
      .in("status", ["active", "closed"])
      .order("created_at", { ascending: false })
      .limit(60);
    return polls || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const state = findState(params.state);
  const lang = cookies().get("lang")?.value === "hi" ? "hi" : "en";
  const { t } = getDict(lang);
  if (!state) return { title: t("poll_notFound") };
  const title = t("state_title", { state });
  return {
    title,
    description: t("state_sub", { state }),
    alternates: { canonical: `${siteUrl()}/${slugify(state)}` },
  };
}

export default async function StatePage({ params }) {
  const state = findState(params.state);
  if (!state) notFound();

  const lang = cookies().get("lang")?.value === "hi" ? "hi" : "en";
  const { t } = getDict(lang);
  const polls = await getStateData(state);

  const districts = [...new Set(polls.map((p) => p.district))].sort();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <p className="text-xs uppercase tracking-widest text-brand-700 font-semibold">{t("unofficial")}</p>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{t("state_title", { state })}</h1>
      <p className="text-slate-500 text-sm mt-1">{t("state_sub", { state })}</p>

      {districts.length > 0 && (
        <section className="mt-8" aria-labelledby="districts">
          <h2 id="districts" className="font-bold text-lg mb-3">{t("browse_districts")}</h2>
          <div className="flex flex-wrap gap-2">
            {districts.map((d) => (
              <Link
                key={d}
                href={`/${slugify(state)}/${slugify(d)}`}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-brand-100 text-sm font-medium text-slate-700 hover:text-brand-800 min-h-[44px] flex items-center"
              >
                {d}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8" aria-labelledby="polls">
        <h2 id="polls" className="font-bold text-lg mb-3">{t("recent_title")}</h2>
        {polls.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {polls.map((p) => (
              <PollCard key={p.id} poll={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">{t("noPolls_here")}</p>
        )}
      </section>
    </div>
  );
}

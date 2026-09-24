import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getDict } from "@/lib/i18n";
import { getAnonClient, siteUrl } from "@/lib/supabase";
import { STATES, slugify } from "@/lib/geo";
import PollCard from "@/components/PollCard";

function findState(slug) {
  return STATES.find((s) => slugify(s) === slug) || null;
}

async function getDistrictData(state, districtSlug) {
  try {
    const db = getAnonClient();
    const { data: polls } = await db
      .from("polls")
      .select("id, slug, village_name, district, state, poll_type, ward_number, status, views, created_at")
      .eq("state", state)
      .in("status", ["active", "closed"])
      .order("created_at", { ascending: false })
      .limit(100);
    return (polls || []).filter((p) => slugify(p.district) === districtSlug);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const state = findState(params.state);
  const lang = cookies().get("lang")?.value === "hi" ? "hi" : "en";
  const { t } = getDict(lang);
  if (!state) return { title: t("poll_notFound") };
  const polls = await getDistrictData(state, params.district);
  const district = polls[0]?.district || params.district;
  const title = t("district_title", { district });
  return {
    title,
    description: t("district_sub", { district, state }),
    alternates: { canonical: `${siteUrl()}/${slugify(state)}/${params.district}` },
  };
}

export default async function DistrictPage({ params }) {
  const state = findState(params.state);
  if (!state) notFound();
  const polls = await getDistrictData(state, params.district);
  if (!polls.length) notFound();

  const lang = cookies().get("lang")?.value === "hi" ? "hi" : "en";
  const { t } = getDict(lang);
  const district = polls[0].district;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("district_title", { district }),
    url: `${siteUrl()}/${slugify(state)}/${params.district}`,
    description: t("district_sub", { district, state }),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-xs uppercase tracking-widest text-brand-700 font-semibold">{t("unofficial")}</p>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{t("district_title", { district })}</h1>
      <p className="text-slate-500 text-sm mt-1">{t("district_sub", { district, state })}</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {polls.map((p) => (
          <PollCard key={p.id} poll={p} />
        ))}
      </div>
    </div>
  );
}

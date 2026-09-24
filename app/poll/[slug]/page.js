import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getDict } from "@/lib/i18n";
import { getAnonClient, siteUrl } from "@/lib/supabase";
import { cleanText } from "@/lib/validate";
import PollView from "@/components/PollView";

async function getPoll(slug) {
  try {
    const db = getAnonClient();
    const { data: poll } = await db
      .from("polls")
      .select("id, slug, state, district, block, village_name, poll_type, ward_number, status, expires_at, views, created_at")
      .eq("slug", cleanText(slug, 120))
      .in("status", ["active", "closed"])
      .single();
    if (!poll) return null;
    const { data: candidates } = await db
      .from("candidates")
      .select("id, name, photo_url, description")
      .eq("poll_id", poll.id)
      .order("position");
    return { poll, candidates: candidates || [] };
  } catch {
    return null;
  }
}

function titleFor(poll, t) {
  const typeLabel = t(`pollType_${poll.poll_type}`) || poll.poll_type;
  const ward = poll.poll_type === "ward_panch" && poll.ward_number ? ` ${t("ward")} ${poll.ward_number}` : "";
  return `${poll.village_name}${ward} ${typeLabel} ${t("opinionPoll")}`;
}

export async function generateMetadata({ params }) {
  const data = await getPoll(params.slug);
  const lang = cookies().get("lang")?.value === "hi" ? "hi" : "en";
  const { t } = getDict(lang);
  const url = `${siteUrl()}/poll/${params.slug}`;
  if (!data) return { title: t("poll_notFound") };

  const title = `${titleFor(data.poll, t)} 2026`;
  const description = `See the current public opinion poll for ${data.poll.village_name}, ${data.poll.district}, ${data.poll.state} and share your response. Unofficial poll — not an official election vote.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: t("brandName"),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PollPage({ params }) {
  const data = await getPoll(params.slug);
  if (!data) notFound();

  const lang = cookies().get("lang")?.value === "hi" ? "hi" : "en";
  const { t } = getDict(lang);
  const poll = {
    ...data.poll,
    isExpired: data.poll.expires_at ? new Date(data.poll.expires_at).getTime() < Date.now() : false,
  };
  const pollUrl = `${siteUrl()}/poll/${data.poll.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: titleFor(data.poll, t),
    url: pollUrl,
    description: "Unofficial public opinion poll. Not an official election vote.",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t("nav_home"), item: siteUrl() },
        { "@type": "ListItem", position: 2, name: data.poll.state, item: `${siteUrl()}/${data.poll.state}` },
        { "@type": "ListItem", position: 3, name: titleFor(data.poll, t), item: pollUrl },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PollView poll={poll} candidates={data.candidates} pollUrl={pollUrl} />
    </>
  );
}

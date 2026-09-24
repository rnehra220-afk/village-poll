import { cookies } from "next/headers";
import { getDict } from "@/lib/i18n";
import { siteUrl } from "@/lib/supabase";
import CreateWizard from "@/components/CreateWizard";

export const metadata = {
  title: "Create an Opinion Poll",
  description:
    "Create an unofficial public opinion poll for Sarpanch, Ward Panch or Zila Parishad Member in your village. Takes less than 2 minutes.",
  alternates: { canonical: `${siteUrl()}/create` },
};

export default function CreatePage() {
  const lang = cookies().get("lang")?.value === "hi" ? "hi" : "en";
  const { t } = getDict(lang);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("nav_home"), item: siteUrl() },
              { "@type": "ListItem", position: 2, name: t("nav_create"), item: `${siteUrl()}/create` },
            ],
          }),
        }}
      />
      <CreateWizard />
    </>
  );
}

import { Suspense } from "react";
import { cookies } from "next/headers";
import { getDict } from "@/lib/i18n";
import { siteUrl } from "@/lib/supabase";
import SearchClient from "@/components/SearchClient";

export const metadata = {
  title: "Find a Village Poll",
  description: "Search unofficial village opinion polls by village, district, state, poll type or ward number.",
  alternates: { canonical: `${siteUrl()}/search` },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8">Loading…</div>}>
      <SearchClient />
    </Suspense>
  );
}

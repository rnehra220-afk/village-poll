import { siteUrl } from "@/lib/supabase";

export function LegalShell({ title, updated, children }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="section-title mb-2">{title}</h1>
      <p className="text-xs text-slate-400 mb-8">Last updated: {updated}</p>
      <div className="space-y-5 text-[15px] text-slate-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function H({ children }) {
  return <h2 className="text-lg font-bold text-slate-900 pt-2">{children}</h2>;
}

export function P({ children }) {
  return <p>{children}</p>;
}

export function legalMetadata(title, path, desc) {
  // Static metadata (evaluated at build time): legal pages are English.
  // Importing next/headers here would break static prerendering.
  return {
    title,
    description: desc,
    alternates: { canonical: `${siteUrl()}/${path}` },
  };
}

"use client";

import Link from "next/link";
import { useLang } from "./Providers";

export default function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-bold text-slate-900">{t("brandName")}</p>
          <p className="text-sm text-slate-600 mt-2">{t("footer_about")}</p>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">
            {t("footer_unofficial")}
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm mb-3">{t("footer_quick")}</p>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-slate-600 hover:text-brand-600" href="/create">{t("nav_create")}</Link></li>
            <li><Link className="text-slate-600 hover:text-brand-600" href="/search">{t("nav_find")}</Link></li>
            <li><Link className="text-slate-600 hover:text-brand-600" href="/my-polls">{t("nav_myPolls")}</Link></li>
            <li><Link className="text-slate-600 hover:text-brand-600" href="/contact">{t("contact_title")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm mb-3">{t("footer_legal")}</p>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-slate-600 hover:text-brand-600" href="/privacy">{t("page_privacy")}</Link></li>
            <li><Link className="text-slate-600 hover:text-brand-600" href="/terms">{t("page_terms")}</Link></li>
            <li><Link className="text-slate-600 hover:text-brand-600" href="/cookies">{t("page_cookies")}</Link></li>
            <li><Link className="text-slate-600 hover:text-brand-600" href="/guidelines">{t("page_guidelines")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-500">
          © {year} {t("brandName")}. {t("footer_rights")}
        </div>
      </div>
    </footer>
  );
}

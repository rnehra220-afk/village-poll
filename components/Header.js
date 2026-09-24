"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "./Providers";

export default function Header() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("nav_home") },
    { href: "/create", label: t("nav_create") },
    { href: "/search", label: t("nav_find") },
    { href: "/my-polls", label: t("nav_myPolls") },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg" aria-hidden>
              वि
            </span>
            <span className="leading-tight">
              <span className="block font-bold text-slate-900">{t("brandName")}</span>
              <span className="block text-[11px] text-slate-500">{t("tagline")}</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 min-h-[44px] flex items-center">
                {l.label}
              </Link>
            ))}
            {process.env.NEXT_PUBLIC_ADS_ENABLED !== "false" && (
               <a 
                 href="https://www.profitableratecpmnetwork.com/utj3muwd?key=2ba216118a39b08f43f54ed7c1e2f66f" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="px-3 py-2 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-100 min-h-[44px] flex items-center ml-2 border border-amber-200 bg-amber-50"
               >
                 {lang === 'hi' ? 'विशेष ऑफर' : 'Special Offers'}
               </a>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden" role="group" aria-label="Language">
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-2 text-sm font-medium min-h-[44px] ${lang === "en" ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("hi")}
                className={`px-3 py-2 text-sm font-medium min-h-[44px] ${lang === "hi" ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                हिन्दी
              </button>
            </div>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 min-h-[44px] min-w-[44px]"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              aria-expanded={open}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden pb-3 flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 min-h-[48px] flex items-center"
              >
                {l.label}
              </Link>
            ))}
            {process.env.NEXT_PUBLIC_ADS_ENABLED !== "false" && (
               <a 
                 href="https://www.profitableratecpmnetwork.com/utj3muwd?key=2ba216118a39b08f43f54ed7c1e2f66f" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="px-3 py-3 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-100 min-h-[48px] flex items-center mt-2 border border-amber-200 bg-amber-50"
               >
                 {lang === 'hi' ? 'विशेष ऑफर' : 'Special Offers'}
               </a>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

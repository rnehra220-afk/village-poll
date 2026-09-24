"use client";

import { createContext, useContext, useState } from "react";
import { getDict, LANGS } from "@/lib/i18n";

const LangCtx = createContext(null);

export function LanguageProvider({ initialLang, children }) {
  const [lang, setLangState] = useState(initialLang === "hi" ? "hi" : "en");

  const setLang = (l) => {
    const next = l === "hi" ? "hi" : "en";
    setLangState(next);
    document.cookie = `lang=${next}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem("vp_lang", next);
    } catch {}
  };

  const dict = getDict(lang);
  return (
    <LangCtx.Provider value={{ lang, setLang, t: dict.t, langs: LANGS }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}

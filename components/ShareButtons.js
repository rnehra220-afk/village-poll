"use client";

import { useState } from "react";
import { useLang } from "./Providers";

/**
 * Share buttons: WhatsApp, Telegram, Facebook, Copy link (+ native share).
 * Props: { url, title, pollId? } — pollId enables share-count tracking.
 */
export default function ShareButtons({ url, title, pollId }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const text = `${title} — ${t("unofficial")}`;
  const enc = encodeURIComponent;
  const links = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${enc(text + " " + url)}`,
      bg: "bg-[#25D366] hover:bg-[#1fb857] text-white",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5-.3.6-.7.9-.5 1.2.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.3.2.5.2.7-.1.2-.3.9-1 1.1-1.4.2-.3.5-.3.8-.2.3.1 2 1 2.4 1.1.4.2.6.2.8-.1.3-.2.4-.7.2-1.3z"/></svg>
      ),
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
      bg: "bg-[#229ED9] hover:bg-[#1c8bc0] text-white",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M21.9 4.6 2.7 12.1c-.8.3-.8 1.4.1 1.6l4.8 1.5 1.9 5.7c.3.8 1.3.9 1.8.2l2.7-3.3 5.2 3.8c.6.5 1.6.1 1.8-.7l2.3-14.5c.2-1-.9-1.9-1.4-1.8zM8.6 13.4l9.8-7.5c.2-.1.4.1.2.3l-8.1 8.9-.3 3-1.6-4.7z"/></svg>
      ),
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      bg: "bg-[#1877F2] hover:bg-[#1466d6] text-white",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>
      ),
    },
  ];

  const trackShare = () => {
    if (!pollId) return;
    fetch(`/api/polls/${pollId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "share" }),
    }).catch(() => {});
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    trackShare();
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        trackShare();
      } catch {}
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackShare}
          className={`${l.bg} flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold min-h-[48px] transition`}
          aria-label={`${t("share")} — ${l.name}`}
        >
          {l.icon}
          {l.name}
        </a>
      ))}
      <button
        onClick={copy}
        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold min-h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
        {copied ? t("copied") : t("copy")}
      </button>
      {typeof navigator !== "undefined" && navigator.share && (
        <button
          onClick={nativeShare}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold min-h-[48px] bg-brand-600 hover:bg-brand-700 text-white transition"
        >
          {t("share")}
        </button>
      )}
    </div>
  );
}

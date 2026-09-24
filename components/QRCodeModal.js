"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLang } from "./Providers";

/**
 * QR code modal for a poll URL, with SVG download.
 */
export default function QRCodeModal({ url, title }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const svgWrap = useRef(null);

  const download = () => {
    const svg = svgWrap.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "poll-qr.svg";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold min-h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 14v.01M14 21v.01M18 18h3v3h-3z"/></svg>
        QR Code
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="QR Code">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold text-slate-900 mb-1">{t("poll_qr")}</p>
            <p className="text-xs text-slate-500 mb-4 break-words">{title}</p>
            <div ref={svgWrap} className="flex justify-center bg-white p-3 border border-slate-200 rounded-xl">
              <QRCodeSVG value={url} size={200} level="M" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={download} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white min-h-[48px]">
                {t("poll_qrDownload")}
              </button>
              <button onClick={() => setOpen(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 min-h-[48px]">
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useLang } from "@/components/Providers";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com";

export default function ContactClient() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Village Poll contact — ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="section-title text-center">{t("contact_title")}</h1>
      <p className="text-slate-500 text-center mt-1 mb-6">{t("contact_sub")}</p>

      {sent ? (
        <div className="card p-8 text-center">
          <p className="text-3xl mb-2" aria-hidden>✓</p>
          <p className="font-medium text-slate-900">{t("contact_thanks")}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="card p-6 space-y-4">
          <div>
            <label htmlFor="c-name">{t("contact_name")}</label>
            <input id="c-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </div>
          <div>
            <label htmlFor="c-email">{t("contact_email")}</label>
            <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={150} />
          </div>
          <div>
            <label htmlFor="c-msg">{t("contact_message")}</label>
            <textarea id="c-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={2000} />
          </div>
          <button type="submit" className="btn-primary w-full">{t("contact_send")}</button>
          <p className="text-xs text-slate-400 text-center">
            {CONTACT_EMAIL}
          </p>
        </form>
      )}
    </div>
  );
}

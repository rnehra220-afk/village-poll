"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/Providers";

export default function AdminLogin() {
  const { t } = useLang();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!r.ok) throw new Error();
      router.push("/admin");
      router.refresh();
    } catch {
      setError(t("admin_loginError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="section-title text-center mb-6">{t("admin_loginTitle")}</h1>
      <form onSubmit={submit} className="card p-6 space-y-4">
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3" role="alert">{error}</p>}
        <div>
          <label htmlFor="admin-pass">{t("admin_password")}</label>
          <input
            id="admin-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? t("loading") : t("admin_loginBtn")}
        </button>
      </form>
    </div>
  );
}

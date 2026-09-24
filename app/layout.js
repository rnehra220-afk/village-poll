import { cookies } from "next/headers";
import "./globals.css";
import { getDict } from "@/lib/i18n";
import { siteUrl } from "@/lib/supabase";
import { LanguageProvider } from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Village Poll — Unofficial Village Opinion Polls",
    template: "%s | Village Poll",
  },
  description:
    "Create and share unofficial public opinion polls for Sarpanch, Ward Panch and Zila Parishad positions in your village.",
  openGraph: {
    type: "website",
    siteName: "Village Poll",
    title: "Village Poll — Unofficial Village Opinion Polls",
    description:
      "Create and share unofficial public opinion polls for Sarpanch, Ward Panch and Zila Parishad positions in your village.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  other: process.env.GSC_VERIFICATION
    ? { "google-site-verification": process.env.GSC_VERIFICATION }
    : {},
};

export default function RootLayout({ children }) {
  const lang = cookies().get("lang")?.value === "hi" ? "hi" : "en";
  const { t } = getDict(lang);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t("brandName"),
    url: siteUrl(),
    description:
      "Unofficial village-level public opinion poll platform. Not affiliated with any government election authority.",
  };

  return (
    <html lang={lang}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <LanguageProvider initialLang={lang}>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </LanguageProvider>
        
        {/* Adsterra Global Ads */}
        {process.env.ADS_ENABLED !== "false" && (
          <>
            {/* Popunder */}
            <script type='text/javascript' src='https://pl31496551.profitableratecpmnetwork.com/9a/43/61/9a436105662ca1e2ece319e9e7744dc2.js'></script>
            {/* Social Bar */}
            <script type='text/javascript' src='https://pl31496549.profitableratecpmnetwork.com/cb/5a/d1/cb5ad1dc774270e7aefadec92cd00b1b.js'></script>
          </>
        )}
      </body>
    </html>
  );
}

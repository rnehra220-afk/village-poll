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
            <script type='text/javascript' src='//pl25324888.profitablecpmrate.com/6e/82/f2/6e82f25b271d4976c66f56e9c0db5390.js'></script>
            {/* Social Bar */}
            <script type='text/javascript' src='//pl25324896.profitablecpmrate.com/15/45/5a/15455a409f80a3a7803a61f5c6b904d9.js'></script>
          </>
        )}
      </body>
    </html>
  );
}

import { LegalShell, H, P, legalMetadata } from "@/components/Legal";

export const metadata = legalMetadata(
  "Cookie Policy",
  "cookies",
  "Cookie Policy of Village Poll — what cookies we use and why."
);

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Policy" updated="September 2026">
      <P>
        Village Poll uses a small number of cookies to operate the service. By using the site you
        consent to the cookies described below.
      </P>
      <H>Cookies we use</H>
      <P>
        <strong>lang</strong> — remembers your language choice (English / Hindi). Duration: 1 year.
        <br />
        <strong>vpid</strong> — an anonymous random identifier used to limit one vote per
        poll session/device. Duration: 1 year. HttpOnly.
        <br />
        <strong>vp_admin</strong> — admin panel session, set only after a successful admin login.
        Duration: 12 hours. HttpOnly.
      </P>
      <H>Third-party cookies</H>
      <P>
        If advertising is enabled in the future, the ad network may set its own cookies subject to
        its own policy. Embedded share buttons (WhatsApp, Telegram, Facebook) only activate when you
        click them.
      </P>
      <H>Managing cookies</H>
      <P>
        You can delete or block cookies in your browser settings. Blocking the voter-session cookie
        may allow repeated voting from the same browser; our server-side abuse detection still applies.
      </P>
    </LegalShell>
  );
}

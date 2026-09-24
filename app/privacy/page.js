import { LegalShell, H, P, legalMetadata } from "@/components/Legal";

export const metadata = legalMetadata(
  "Privacy Policy",
  "privacy",
  "Privacy Policy of Village Poll — what data we collect and how it is used."
);

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="September 2026">
      <P>
        Village Poll (“we”, “our”) operates an unofficial public opinion poll platform. This policy
        explains what information we collect and how we use it.
      </P>
      <H>1. Information we collect</H>
      <P>
        <strong>Poll content you provide:</strong> state, district, village name, poll type, candidate
        names and optional descriptions or photo URLs. This content is public by design, because polls
        are meant to be shared.
      </P>
      <P>
        <strong>Voting signals:</strong> when you vote we store an anonymous, one-way hash derived
        from a random session identifier and a server secret. We also store a one-way hash of your IP
        address for abuse detection. We do not ask for your name, phone number or email to vote, and
        we never publish voter IP addresses or device identifiers.
      </P>
      <P>
        <strong>Technical data:</strong> we use a small number of cookies (language preference, voter
        session, admin session) and count anonymous page views and shares to operate the service.
      </P>
      <H>2. How we use information</H>
      <P>
        We use collected information to operate polls, prevent duplicate or abusive voting, display
        aggregate results, moderate reported content, and improve the service. We do not sell personal
        data.
      </P>
      <H>3. Data sharing</H>
      <P>
        Public poll content (village, candidates, aggregate vote counts) is visible to anyone with the
        poll link. We do not share voter-level data with third parties except as required by law.
      </P>
      <H>4. Data retention</H>
      <P>
        Polls remain visible until the creator closes or deletes them, or until moderation removes
        them. Anonymous vote records are kept as long as the poll exists.
      </P>
      <H>5. Your choices</H>
      <P>
        You can clear your browser cookies to reset your voter session and language preference.
        Poll creators can close or delete their polls at any time using their private management link.
        To request removal of content, contact us via the Contact page.
      </P>
      <H>6. Children</H>
      <P>This service is intended for a general audience and is not directed at children under 13.</P>
      <H>7. Changes</H>
      <P>We may update this policy; the “Last updated” date above will reflect the latest version.</P>
    </LegalShell>
  );
}

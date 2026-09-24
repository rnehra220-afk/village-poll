import { LegalShell, H, P, legalMetadata } from "@/components/Legal";

export const metadata = legalMetadata(
  "Terms of Use",
  "terms",
  "Terms of Use of Village Poll — rules for using the unofficial opinion poll platform."
);

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Use" updated="September 2026">
      <P>By using Village Poll you agree to these terms.</P>
      <H>1. Unofficial opinion polls only</H>
      <P>
        This platform provides <strong>unofficial public opinion polls</strong> for informational and
        entertainment purposes. Votes submitted here are <strong>not official election votes</strong>{" "}
        and do not affect any government election result. We are not affiliated with or operated by
        the Election Commission of India or any government election authority. Never represent a poll
        on this platform as an official election or result.
      </P>
      <H>2. Acceptable use</H>
      <P>You agree not to:</P>
      <P>
        • Submit false, misleading or impersonating candidate information
        <br />• Attempt to manipulate results (bots, vote buying, automated voting)
        <br />• Post hateful, obscene or harassing content
        <br />• Misrepresent polls as official or government-run
        <br />• Interfere with the service’s operation or security
      </P>
      <H>3. Content responsibility</H>
      <P>
        Poll creators are responsible for the candidate names and details they publish. We may hide,
        close or delete polls and content that violate these terms or that are reported and confirmed
        to be problematic, without prior notice.
      </P>
      <H>4. No warranties</H>
      <P>
        The service is provided “as is”. We do not guarantee uninterrupted availability, and poll
        results are informal aggregates that may not represent the views of any wider population.
      </P>
      <H>5. Limitation of liability</H>
      <P>
        To the maximum extent permitted by law, we are not liable for any decisions made based on
        poll results or for user-generated content.
      </P>
      <H>6. Changes</H>
      <P>We may update these terms; continued use of the service constitutes acceptance.</P>
    </LegalShell>
  );
}

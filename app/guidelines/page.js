import { LegalShell, H, P, legalMetadata } from "@/components/Legal";

export const metadata = legalMetadata(
  "Community Guidelines",
  "guidelines",
  "Community Guidelines of Village Poll — keep polls fair, neutral and respectful."
);

export default function GuidelinesPage() {
  return (
    <LegalShell title="Community Guidelines" updated="September 2026">
      <P>
        Village Poll only works if polls stay fair, neutral and respectful. These guidelines apply to
        everyone who creates, shares or votes in polls.
      </P>
      <H>1. Stay neutral</H>
      <P>
        Polls must not endorse or attack candidates, use party symbols or propaganda, predict winners,
        or claim that results are official election outcomes. Describe candidates factually.
      </P>
      <H>2. Be truthful</H>
      <P>
        Use real candidate names as they are publicly known. Do not impersonate real people, and do
        not create duplicate polls for the same village and position to split or spam results.
      </P>
      <H>3. No manipulation</H>
      <P>
        One vote per poll session/device is the rule. Do not use bots, scripts, paid voting or
        coordinated inauthentic behaviour to inflate a candidate’s count.
      </P>
      <H>4. Respect others</H>
      <P>
        No hate speech, threats, obscenity or harassment in candidate descriptions or poll titles.
        Keep it about the poll, not personal attacks.
      </P>
      <H>5. Unofficial, always</H>
      <P>
        Never present a Village Poll link as an official government voting page or election result.
        Misrepresentation leads to removal.
      </P>
      <H>6. Reporting</H>
      <P>
        Every public poll has a “Report Poll” option. Our moderation team reviews reports and may
        hide, close or delete violating polls. Repeated violations may lead to blocking.
      </P>
    </LegalShell>
  );
}

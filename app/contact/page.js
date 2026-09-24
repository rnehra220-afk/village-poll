import { siteUrl } from "@/lib/supabase";
import ContactClient from "@/components/ContactClient";

export const metadata = {
  title: "Contact Us",
  description: "Contact the Village Poll team with questions, feedback or moderation requests.",
  alternates: { canonical: `${siteUrl()}/contact` },
};

export default function ContactPage() {
  return <ContactClient />;
}

import { siteUrl } from "@/lib/supabase";
import MyPollsClient from "@/components/MyPollsClient";

export const metadata = {
  title: "My Polls",
  description: "Polls you created on this device.",
  alternates: { canonical: `${siteUrl()}/my-polls` },
  robots: { index: false, follow: false },
};

export default function MyPollsPage() {
  return <MyPollsClient />;
}

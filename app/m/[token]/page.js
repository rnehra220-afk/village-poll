import ManageClient from "@/components/ManageClient";

export const metadata = {
  title: "Manage Poll",
  robots: { index: false, follow: false },
};

export default function ManagePage({ params }) {
  return <ManageClient token={params.token} />;
}

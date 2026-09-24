import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  if (!isAdmin()) redirect("/admin/login");
  return <AdminDashboard />;
}

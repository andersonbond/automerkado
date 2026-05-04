import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { getDashboardAnalytics } from "@/lib/services/dashboard";

export default async function AdminDashboardPage() {
  const analytics = await getDashboardAnalytics();

  return <AdminDashboardView analytics={analytics} />;
}

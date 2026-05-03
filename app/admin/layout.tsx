import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin",
};

/** Admin routes fetch live DB data — avoid static prerender during `next build`. */
export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-svh min-h-0 overflow-hidden bg-surface">
      <AdminSidebar />
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain">
        {children}
      </div>
    </div>
  );
}

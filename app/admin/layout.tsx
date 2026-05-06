import type { Metadata } from "next";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import { getSiteLogoSrc } from "@/lib/siteLogo";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin",
};

/** Admin routes fetch live DB data — avoid static prerender during `next build`. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logoSrc = await getSiteLogoSrc();

  return (
    <AdminLayoutClient logoSrc={logoSrc}>{children}</AdminLayoutClient>
  );
}

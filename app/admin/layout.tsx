import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import { auth } from "@/auth";
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
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    const hdrs = await headers();
    const path =
      hdrs.get("x-automerkado-admin-path") ?? "/admin";
    redirect(`/login?callbackUrl=${encodeURIComponent(path)}`);
  }

  const logoSrc = await getSiteLogoSrc();

  return (
    <AdminLayoutClient logoSrc={logoSrc}>{children}</AdminLayoutClient>
  );
}

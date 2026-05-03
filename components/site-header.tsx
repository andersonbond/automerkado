import { auth } from "@/auth";
import { SiteHeaderBar } from "@/components/site-header-bar";

export async function SiteHeader() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-[100] isolate border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <SiteHeaderBar isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
    </header>
  );
}

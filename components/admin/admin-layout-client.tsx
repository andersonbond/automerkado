"use client";

import NextImage from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isPublicUploadPath } from "@/lib/nextImage";
import { LogoutButton } from "@/components/logout-button";
import {
  Car,
  ExternalLink,
  FolderOpen,
  Image,
  Inbox,
  LayoutDashboard,
  Menu,
  Newspaper,
  Settings,
  X,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/cars", label: "Cars", Icon: Car },
  { href: "/admin/inquiries", label: "Inquiries", Icon: Inbox },
  { href: "/admin/images", label: "Images", Icon: Image },
  { href: "/admin/files", label: "Files", Icon: FolderOpen },
  { href: "/admin/blog", label: "Blog", Icon: Newspaper },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
] as const;

const linkClass =
  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10";

const iconClass = "h-4 w-4 shrink-0 opacity-90";

const ADMIN_NAV_PANEL_ID = "admin-sidebar-nav";

export function AdminLayoutClient({
  logoSrc,
  children,
}: {
  logoSrc: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const asideClass = [
    "flex w-56 shrink-0 flex-col overflow-hidden border-r border-surface bg-[#2f3542] text-white",
    "fixed top-14 bottom-0 left-0 z-50 transition-[transform] duration-200 ease-out md:static md:top-auto md:z-auto md:h-auto md:min-h-0 md:translate-x-0 md:transition-none",
    mobileNavOpen
      ? "translate-x-0"
      : "-translate-x-full pointer-events-none md:pointer-events-auto md:translate-x-0",
  ].join(" ");

  return (
    <div className="flex h-svh min-h-0 flex-col overflow-hidden bg-surface md:flex-row">
      <header className="relative z-[60] flex h-14 shrink-0 items-center gap-3 border-b border-surface bg-surface px-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen((o) => !o)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-800 hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10"
          aria-expanded={mobileNavOpen}
          aria-controls={ADMIN_NAV_PANEL_ID}
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileNavOpen ? (
            <X className="h-6 w-6" aria-hidden />
          ) : (
            <Menu className="h-6 w-6" aria-hidden />
          )}
        </button>
        <span className="truncate text-sm font-semibold text-slate-800 dark:text-white/90">
          Admin
        </span>
      </header>

      {mobileNavOpen ? (
        <div
          className="fixed top-14 right-0 bottom-0 left-0 z-40 bg-black/50 md:hidden"
          aria-hidden
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside className={asideClass}>
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-white/10 px-4 py-5">
          <div className="min-w-0">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-lg font-bold text-brand"
              onClick={() => setMobileNavOpen(false)}
            >
              <span className="relative h-7 w-7 shrink-0 brightness-110">
                <NextImage
                  src={logoSrc}
                  alt=""
                  width={28}
                  height={28}
                  className="h-full w-full object-contain"
                  sizes="28px"
                  unoptimized={isPublicUploadPath(logoSrc)}
                />
              </span>
              Automerkado
            </Link>
            <p className="mt-1 text-xs text-white/60">Car Management System</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md p-2 text-white/80 hover:bg-white/10 md:hidden"
            aria-label="Close navigation menu"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <nav
          id={ADMIN_NAV_PANEL_ID}
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-3"
          aria-label="Admin navigation"
        >
          {links.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={linkClass}
              onClick={() => setMobileNavOpen(false)}
            >
              <Icon className={iconClass} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="shrink-0 border-t border-white/10 p-3">
          <LogoutButton
            withIcon
            className="text-sm text-white/80 hover:text-white"
            onBeforeSignOut={() => setMobileNavOpen(false)}
          />
          <Link
            href="/"
            className={`${linkClass} mt-3 text-xs text-white/60 hover:text-white`}
            onClick={() => setMobileNavOpen(false)}
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            View site
          </Link>
        </div>
      </aside>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain">{children}</div>
    </div>
  );
}

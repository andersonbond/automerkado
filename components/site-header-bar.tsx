"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Car,
  CircleHelp,
  Info,
  Mail,
  Menu,
  Newspaper,
  Shield,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSelect } from "@/components/theme-select";

const linkClass =
  "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-foreground transition-colors hover:text-brand";

const iconClass = "h-4 w-4 shrink-0 opacity-80";

/** Mobile drawer uses a fixed white surface (readable in any theme). */
const mobileLinkClass =
  "inline-flex items-center gap-2 rounded-lg px-2 py-2.5 text-base font-medium text-zinc-900 hover:bg-zinc-100";

const mainNav = [
  { href: "/listings/certified", label: "Certified", Icon: BadgeCheck },
  { href: "/listings/repossessed", label: "Repossessed", Icon: Car },
  { href: "/blog", label: "Blog", Icon: Newspaper },
  { href: "/about", label: "About", Icon: Info },
  { href: "/faq", label: "FAQ", Icon: CircleHelp },
  { href: "/contact", label: "Contact", Icon: Mail },
] as const;

export function SiteHeaderBar({
  isAuthenticated,
  isAdmin,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4 py-3.5">
        <Link
          href="/"
          className="inline-flex min-w-0 items-center gap-2.5 text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          onClick={close}
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-black/5 dark:ring-white/10">
            <Image
              src="/logo.jpeg"
              alt=""
              width={36}
              height={36}
              className="h-full w-full object-cover object-center"
              priority
              sizes="36px"
            />
          </span>
          <span className="truncate">Automerkado</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <nav
            className="hidden flex-wrap items-center gap-x-1 gap-y-1 text-sm md:flex"
            aria-label="Main"
          >
            <NavLinks
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              linkClassName={linkClass}
              iconClassName={iconClass}
            />
          </nav>
          <ThemeSelect className="shrink-0" />
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-foreground transition-colors hover:bg-surface md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-6 w-6 shrink-0" aria-hidden />
            ) : (
              <Menu className="h-6 w-6 shrink-0" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-neutral-950/35 backdrop-blur-[2px] md:hidden"
            aria-label="Close menu"
            onClick={close}
          />
          <nav
            className="relative z-50 flex flex-col border-t border-zinc-200/90 bg-white py-3 shadow-soft md:hidden"
            aria-label="Main mobile"
          >
            <NavLinks
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              linkClassName={mobileLinkClass}
              iconClassName="h-5 w-5 shrink-0 opacity-80"
              onNavigate={close}
            />
          </nav>
        </>
      ) : null}
    </div>
  );
}

function NavLinks({
  isAuthenticated,
  isAdmin,
  linkClassName,
  iconClassName,
  onNavigate,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
  linkClassName: string;
  iconClassName: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {mainNav.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className={linkClassName}
          onClick={onNavigate}
        >
          <Icon className={iconClassName} aria-hidden />
          {label}
        </Link>
      ))}
      {isAuthenticated ? (
        <>
          <Link
            href="/account"
            className={linkClassName}
            onClick={onNavigate}
          >
            <User className={iconClassName} aria-hidden />
            Account
          </Link>
          {isAdmin ? (
            <Link href="/admin" className={linkClassName} onClick={onNavigate}>
              <Shield className={iconClassName} aria-hidden />
              Admin
            </Link>
          ) : null}
          <LogoutButton
            withIcon
            iconClassName={onNavigate ? iconClassName : undefined}
            onBeforeSignOut={onNavigate}
            className={
              onNavigate
                ? "inline-flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-base font-medium text-zinc-900 hover:bg-zinc-100 hover:text-brand"
                : "inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand"
            }
          />
        </>
      ) : null}
    </>
  );
}

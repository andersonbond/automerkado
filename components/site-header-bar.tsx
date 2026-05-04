"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Car,
  CircleHelp,
  Info,
  Menu,
  Newspaper,
  Phone,
  Shield,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSelect } from "@/components/theme-select";

const linkClass =
  "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-foreground transition-colors hover:text-brand";

const iconClass = "h-4 w-4 shrink-0 opacity-80";

/** Slide-over menu (dark glass; portals to body so it clears hero / stacking contexts). */
const sheetBackdropClass =
  "min-h-[100dvh] min-w-0 flex-1 bg-neutral-950/60 backdrop-blur-sm";
const sheetPanelClass =
  "flex h-[100dvh] min-h-0 w-[min(100%,21rem)] shrink-0 flex-col overflow-hidden rounded-l-3xl border-l border-white/12 bg-[linear-gradient(155deg,rgba(22,26,38,0.97)_0%,rgba(10,11,17,0.98)_48%,rgba(11,13,21,1)_100%)] shadow-[28px_0_80px_-20px_rgba(0,0,0,0.75)] backdrop-blur-xl ring-1 ring-white/[0.08]";
const sheetHeaderClass =
  "flex shrink-0 items-center justify-between gap-3 border-b border-white/12 px-5 pb-4 pt-[max(14px,calc(env(safe-area-inset-top,0)+10px))]";
const sheetLinkClass =
  "inline-flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-white/92 transition-colors hover:bg-brand/15 hover:text-white";

const sheetIconClass = "h-5 w-5 shrink-0 text-brand/90";

const mainNav = [
  { href: "/listings/certified", label: "Certified", Icon: BadgeCheck },
  { href: "/listings/repossessed", label: "Repossessed", Icon: Car },
  { href: "/contact", label: "Contact", Icon: Phone },
  { href: "/faq", label: "FAQ", Icon: CircleHelp },
  { href: "/about", label: "About", Icon: Info },
  { href: "/blog", label: "Blog", Icon: Newspaper },
] as const;

export function SiteHeaderBar({
  isAuthenticated,
  isAdmin,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="relative z-[2] flex items-center justify-between gap-4 py-3.5">
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
            className="relative z-[60] inline-flex rounded-xl border border-border/80 bg-background/60 p-2 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-surface hover:border-brand/25 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            id="mobile-menu-trigger"
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

      {mounted && open
        ? createPortal(
            <div
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-nav-heading"
              className="fixed inset-0 z-[250] flex max-h-[100dvh] flex-row md:hidden"
            >
              <button
                type="button"
                className={sheetBackdropClass}
                aria-label="Close menu"
                onClick={close}
              />
              <div className={sheetPanelClass}>
                <span id="mobile-nav-heading" className="sr-only">
                  Main menu
                </span>
                <div className={sheetHeaderClass}>
                  <Link
                    href="/"
                    className="flex min-w-0 flex-1 items-center gap-2 transition-opacity hover:opacity-95"
                    onClick={close}
                  >
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-2 ring-brand/40">
                      <Image
                        src="/logo.jpeg"
                        alt=""
                        width={36}
                        height={36}
                        className="h-full w-full object-cover object-center"
                        sizes="36px"
                      />
                    </span>
                    <span className="truncate text-sm font-semibold tracking-tight text-white">
                      Automerkado
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="shrink-0 rounded-xl border border-white/18 bg-white/[0.07] p-2.5 text-white transition-colors hover:border-white/30 hover:bg-white/12"
                    aria-label="Close menu"
                    onClick={close}
                  >
                    <X className="h-5 w-5 shrink-0" aria-hidden />
                  </button>
                </div>
                <nav
                  className="flex flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 py-5"
                  aria-label="Main mobile navigation"
                >
                  {mainNav.map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={sheetLinkClass}
                      onClick={close}
                    >
                      <Icon className={sheetIconClass} aria-hidden />
                      {label}
                    </Link>
                  ))}
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/account"
                        className={sheetLinkClass}
                        onClick={close}
                      >
                        <User className={sheetIconClass} aria-hidden />
                        Account
                      </Link>
                      {isAdmin ? (
                        <Link
                          href="/admin"
                          className={sheetLinkClass}
                          onClick={close}
                        >
                          <Shield className={sheetIconClass} aria-hidden />
                          Admin
                        </Link>
                      ) : null}
                      <LogoutButton
                        withIcon
                        iconClassName={sheetIconClass}
                        onBeforeSignOut={close}
                        className="inline-flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-[15px] font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
                      />
                    </>
                  ) : null}
                </nav>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function NavLinks({
  isAuthenticated,
  isAdmin,
  linkClassName,
  iconClassName,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
  linkClassName: string;
  iconClassName: string;
}) {
  return (
    <>
      {mainNav.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className={linkClassName}>
          <Icon className={iconClassName} aria-hidden />
          {label}
        </Link>
      ))}
      {isAuthenticated ? (
        <>
          <Link href="/account" className={linkClassName}>
            <User className={iconClassName} aria-hidden />
            Account
          </Link>
          {isAdmin ? (
            <Link href="/admin" className={linkClassName}>
              <Shield className={iconClassName} aria-hidden />
              Admin
            </Link>
          ) : null}
          <LogoutButton
            withIcon
            iconClassName={iconClassName}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand"
          />
        </>
      ) : null}
    </>
  );
}

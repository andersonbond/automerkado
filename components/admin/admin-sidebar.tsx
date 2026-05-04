import NextImage from "next/image";
import Link from "next/link";
import {
  Car,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Image,
  Inbox,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

const links = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/cars", label: "Cars", Icon: Car },
  { href: "/admin/inquiries", label: "Inquiries", Icon: Inbox },
  { href: "/admin/images", label: "Images", Icon: Image },
  { href: "/admin/files", label: "Files", Icon: FolderOpen },
  { href: "/admin/inspections", label: "Inspections", Icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
] as const;

const linkClass =
  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10";

const iconClass = "h-4 w-4 shrink-0 opacity-90";

export function AdminSidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col overflow-hidden border-r border-surface bg-[#2f3542] text-white">
      <div className="shrink-0 border-b border-white/10 px-4 py-5">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-lg font-bold text-brand"
        >
          <span className="relative h-7 w-7 shrink-0 brightness-110">
            <NextImage
              src="/logo.svg"
              alt=""
              width={28}
              height={28}
              className="h-full w-full object-contain"
              sizes="28px"
            />
          </span>
          Automerkado
        </Link>
        <p className="mt-1 text-xs text-white/60">Car Management System</p>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-3">
        {links.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={linkClass}>
            <Icon className={iconClass} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
      <div className="shrink-0 border-t border-white/10 p-3">
        <LogoutButton
          withIcon
          className="text-sm text-white/80 hover:text-white"
        />
        <Link
          href="/"
          className={`${linkClass} mt-3 text-xs text-white/60 hover:text-white`}
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          View site
        </Link>
      </div>
    </aside>
  );
}

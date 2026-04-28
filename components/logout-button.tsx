"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton({
  className,
  withIcon,
  iconClassName,
  onBeforeSignOut,
}: {
  className?: string;
  withIcon?: boolean;
  iconClassName?: string;
  onBeforeSignOut?: () => void;
}) {
  const merged = [
    withIcon ? "inline-flex items-center gap-1.5" : "",
    className ?? "text-muted hover:text-brand",
  ]
    .filter(Boolean)
    .join(" ");

  const iconCls = iconClassName ?? "h-4 w-4 shrink-0 opacity-80";

  return (
    <button
      type="button"
      onClick={() => {
        onBeforeSignOut?.();
        void signOut({ callbackUrl: "/" });
      }}
      className={merged}
    >
      {withIcon ? <LogOut className={iconCls} aria-hidden /> : null}
      Log out
    </button>
  );
}

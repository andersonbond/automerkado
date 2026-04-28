"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/** Light / dark only — segmented toggle (no system, no dropdown). */
export function ThemeSelect({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        className={`inline-block h-9 w-[4.75rem] shrink-0 rounded-full border border-transparent ${className ?? ""}`}
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={`inline-flex shrink-0 rounded-full border border-border bg-surface p-0.5 shadow-sm ${className ?? ""}`}
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={!isDark}
        aria-label="Light mode"
        className={
          !isDark
            ? "rounded-full bg-card p-2 text-foreground shadow-sm transition-colors"
            : "rounded-full p-2 text-muted transition-colors hover:text-foreground"
        }
      >
        <Sun className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        aria-label="Dark mode"
        className={
          isDark
            ? "rounded-full bg-card p-2 text-foreground shadow-sm transition-colors"
            : "rounded-full p-2 text-muted transition-colors hover:text-foreground"
        }
      >
        <Moon className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}

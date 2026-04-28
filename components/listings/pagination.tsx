import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  basePath,
  page,
  totalPages,
  query,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  query: URLSearchParams;
}) {
  if (totalPages <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  function href(p: number) {
    const q = new URLSearchParams(query);
    if (p === 1) q.delete("page");
    else q.set("page", String(p));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  }

  const navBtn =
    "inline-flex min-h-10 items-center gap-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface";

  return (
    <nav
      className="mt-12 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:gap-6"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link href={href(prev)} className={navBtn}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </Link>
      ) : (
        <span className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-transparent px-4 py-2 text-muted">
          <ChevronLeft className="h-4 w-4 opacity-40" aria-hidden />
          Previous
        </span>
      )}
      <span className="tabular-nums text-muted">
        Page <span className="font-semibold text-foreground">{page}</span> of{" "}
        {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(next)} className={navBtn}>
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-transparent px-4 py-2 text-muted">
          Next
          <ChevronRight className="h-4 w-4 opacity-40" aria-hidden />
        </span>
      )}
    </nav>
  );
}

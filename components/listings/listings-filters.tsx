"use client";

import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { CAR_BODY_TYPES, isCarBodyType } from "@/lib/carBodyTypes";
import { CAR_FUEL_TYPES, isCarFuelType } from "@/lib/carFuelTypes";
import { POPULAR_CAR_BRANDS } from "@/lib/carBrands";

const INLINE_TAG_LIMIT = 5;

function tagsForInlineChips(
  tags: { slug: string; name: string }[],
  selectedSlug: string | null,
  limit: number,
) {
  if (tags.length <= limit) return tags;
  const selected = selectedSlug
    ? tags.find((t) => t.slug === selectedSlug)
    : undefined;
  const others = selected
    ? tags.filter((t) => t.slug !== selectedSlug)
    : [...tags];
  const ordered = selected ? [selected, ...others] : others;
  return ordered.slice(0, limit);
}

function tagChipButtonClass(active: boolean) {
  return active
    ? "rounded-full border border-brand bg-brand/10 px-3.5 py-1.5 text-sm font-semibold text-foreground ring-1 ring-brand/25"
    : "rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:border-brand/30 hover:text-foreground";
}

function countActiveFilters(sp: URLSearchParams): number {
  let n = 0;
  if (sp.get("q")?.trim()) n += 1;
  if (sp.get("brand")) n += 1;
  const bt = sp.get("bodyType");
  if (bt && isCarBodyType(bt)) n += 1;
  const ft = sp.get("fuelType");
  if (ft && isCarFuelType(ft)) n += 1;
  if (sp.get("tag")) n += 1;
  if (sp.get("minPrice")) n += 1;
  if (sp.get("maxPrice")) n += 1;
  if (sp.get("minYear")) n += 1;
  if (sp.get("maxYear")) n += 1;
  return n;
}

type Props = {
  basePath: string;
  tagOptions?: { slug: string; name: string }[];
  defaults?: {
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
  };
};

const inputBase =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition-shadow placeholder:text-muted focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/20";

const inputClass = `mt-1.5 ${inputBase}`;

export function ListingsFilters({
  basePath,
  tagOptions = [],
  defaults = {},
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const allTagsDialogRef = useRef<HTMLDialogElement>(null);
  const activeFilterCount = countActiveFilters(sp);

  useEffect(() => {
    if (!filtersOpen) allTagsDialogRef.current?.close();
  }, [filtersOpen]);

  const [search, setSearch] = useState(defaults.search ?? sp.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(
    defaults.minPrice ?? sp.get("minPrice") ?? "",
  );
  const [maxPrice, setMaxPrice] = useState(
    defaults.maxPrice ?? sp.get("maxPrice") ?? "",
  );
  const [minYear, setMinYear] = useState(
    defaults.minYear ?? sp.get("minYear") ?? "",
  );
  const [maxYear, setMaxYear] = useState(
    defaults.maxYear ?? sp.get("maxYear") ?? "",
  );

  const apply = useCallback(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    const brand = sp.get("brand");
    if (brand) params.set("brand", brand);
    const bodyType = sp.get("bodyType");
    if (bodyType && isCarBodyType(bodyType)) params.set("bodyType", bodyType);
    const fuelType = sp.get("fuelType");
    if (fuelType && isCarFuelType(fuelType))
      params.set("fuelType", fuelType);
    const tag = sp.get("tag");
    if (tag && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag))
      params.set("tag", tag);
    if (minPrice.trim()) params.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
    if (minYear.trim()) params.set("minYear", minYear.trim());
    if (maxYear.trim()) params.set("maxYear", maxYear.trim());
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${basePath}?${qs}` : basePath);
    });
  }, [basePath, router, search, minPrice, maxPrice, minYear, maxYear, sp]);

  const selectedBrand = sp.get("brand");
  const selectedBodyType = sp.get("bodyType");
  const selectedFuelType = sp.get("fuelType");
  const selectedTag = sp.get("tag");

  const toggleBrand = useCallback(
    (b: string) => {
      const next = new URLSearchParams(sp.toString());
      if (selectedBrand === b) {
        next.delete("brand");
      } else {
        next.set("brand", b);
      }
      next.delete("page");
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${basePath}?${qs}` : basePath);
      });
    },
    [basePath, router, sp, selectedBrand],
  );

  const toggleBodyType = useCallback(
    (value: string) => {
      const next = new URLSearchParams(sp.toString());
      if (selectedBodyType === value) {
        next.delete("bodyType");
      } else {
        next.set("bodyType", value);
      }
      next.delete("page");
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${basePath}?${qs}` : basePath);
      });
    },
    [basePath, router, sp, selectedBodyType],
  );

  const toggleFuelType = useCallback(
    (value: string) => {
      const next = new URLSearchParams(sp.toString());
      if (selectedFuelType === value) {
        next.delete("fuelType");
      } else {
        next.set("fuelType", value);
      }
      next.delete("page");
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${basePath}?${qs}` : basePath);
      });
    },
    [basePath, router, sp, selectedFuelType],
  );

  const toggleTag = useCallback(
    (slug: string) => {
      const next = new URLSearchParams(sp.toString());
      if (selectedTag === slug) {
        next.delete("tag");
      } else {
        next.set("tag", slug);
      }
      next.delete("page");
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${basePath}?${qs}` : basePath);
      });
    },
    [basePath, router, sp, selectedTag],
  );

  const openAllTagsDialog = useCallback(() => {
    allTagsDialogRef.current?.showModal();
  }, []);

  const closeAllTagsDialog = useCallback(() => {
    allTagsDialogRef.current?.close();
  }, []);

  const pickTagFromDialog = useCallback(
    (slug: string) => {
      toggleTag(slug);
      allTagsDialogRef.current?.close();
    },
    [toggleTag],
  );

  const inlineTags = tagsForInlineChips(
    tagOptions,
    selectedTag,
    INLINE_TAG_LIMIT,
  );
  const showTagSeeMore = tagOptions.length > INLINE_TAG_LIMIT;

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          id="listing-filters-toggle"
          aria-expanded={filtersOpen}
          aria-controls="listing-filters-panel"
          onClick={() => setFiltersOpen((v) => !v)}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        >
          <Filter className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <span>Filters</span>
          {activeFilterCount > 0 ? (
            <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[11px] font-bold leading-none text-brand-foreground">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      {filtersOpen ? (
        <div
          id="listing-filters-panel"
          role="region"
          aria-labelledby="listing-filters-toggle"
          className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-card"
        >
          <div className="border-b border-border bg-surface/50 px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-muted" aria-hidden />
              Refine results
            </div>
            <p className="mt-1 text-xs text-muted">
              Brand, body type, fuel type, and tag chips apply instantly. Other
              fields use &ldquo;Apply filters&rdquo;.
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Brand
            </p>
            <div
              className="mt-3 flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by brand"
            >
              {POPULAR_CAR_BRANDS.map((brand) => {
                const active = selectedBrand === brand;
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className={
                      active
                        ? "rounded-full border border-brand bg-brand/10 px-3.5 py-1.5 text-sm font-semibold text-foreground ring-1 ring-brand/25"
                        : "rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:border-brand/30 hover:text-foreground"
                    }
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Body type
            </p>
            <div
              className="mt-3 flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by body type"
            >
              {CAR_BODY_TYPES.map((bt) => {
                const active = selectedBodyType === bt;
                return (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => toggleBodyType(bt)}
                    className={tagChipButtonClass(active)}
                  >
                    {bt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Fuel type
            </p>
            <div
              className="mt-3 flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by fuel type"
            >
              {CAR_FUEL_TYPES.map((ft) => {
                const active = selectedFuelType === ft;
                return (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => toggleFuelType(ft)}
                    className={tagChipButtonClass(active)}
                  >
                    {ft}
                  </button>
                );
              })}
            </div>
          </div>

          {tagOptions.length > 0 ? (
            <div className="border-t border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                Tags
              </p>
              <div
                className="mt-3 flex flex-wrap items-center gap-2"
                role="group"
                aria-label="Filter by tag"
              >
                {inlineTags.map((tag) => {
                  const active = selectedTag === tag.slug;
                  return (
                    <button
                      key={tag.slug}
                      type="button"
                      onClick={() => toggleTag(tag.slug)}
                      className={tagChipButtonClass(active)}
                    >
                      {tag.name}
                    </button>
                  );
                })}
                {showTagSeeMore ? (
                  <button
                    type="button"
                    onClick={openAllTagsDialog}
                    className="rounded-full border border-dashed border-brand/40 bg-brand/5 px-3.5 py-1.5 text-sm font-semibold text-brand transition-colors hover:border-brand/55 hover:bg-brand/10"
                  >
                    See more...
                  </button>
                ) : null}
              </div>

              <dialog
                ref={allTagsDialogRef}
                className="w-[min(100vw-2rem,26rem)] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
                onClick={(e) => {
                  if (e.target === e.currentTarget) closeAllTagsDialog();
                }}
              >
                <div className="border-b border-border px-5 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-foreground">
                        All tags
                      </h3>
                      <p className="mt-1 text-xs text-muted">
                        Choose a tag to filter. Select the same tag again to clear
                        it.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeAllTagsDialog}
                      className="cursor-pointer rounded-lg p-1.5 text-muted transition hover:bg-surface hover:text-foreground"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" aria-hidden />
                    </button>
                  </div>
                </div>
                <div className="max-h-[min(60vh,24rem)] overflow-y-auto px-5 py-4 sm:px-6">
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="All tags"
                  >
                    {tagOptions.map((tag) => {
                      const active = selectedTag === tag.slug;
                      return (
                        <button
                          key={tag.slug}
                          type="button"
                          onClick={() => pickTagFromDialog(tag.slug)}
                          className={tagChipButtonClass(active)}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </dialog>
            </div>
          ) : null}

          <div className="grid gap-4 border-t border-border p-5 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium text-foreground">
              Search
              <span className="relative mt-1.5 block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Brand, model, title, tag, body type, or fuel"
                  className={`${inputBase} pl-9`}
                />
              </span>
            </label>
            <label className="text-sm font-medium text-foreground">
              Min price (PHP)
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-foreground">
              Max price (PHP)
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-foreground">
              Min year
              <input
                type="number"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-foreground">
              Max year
              <input
                type="number"
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface/30 px-5 py-4">
            <button
              type="button"
              onClick={apply}
              disabled={pending}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground transition-opacity disabled:opacity-60"
            >
              {pending ? "Applying…" : "Apply filters"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setMinPrice("");
                setMaxPrice("");
                setMinYear("");
                setMaxYear("");
                startTransition(() => router.push(basePath));
              }}
              className="text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Clear all
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

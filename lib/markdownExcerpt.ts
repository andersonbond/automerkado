/** Rough plain-text excerpt from Markdown for SEO cards (not a full parser). */
export function plainExcerptFromMarkdown(markdown: string, maxLen = 160): string {
  const s = markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length <= maxLen) return s || "Automerkado blog article.";
  return `${s.slice(0, maxLen).replace(/\s+\S*$/, "").trim()}…`;
}

/**
 * Normalizes a tag label to a URL-safe slug (lowercase, hyphenated).
 */
export function slugFromTagLabel(label: string): string {
  let s = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  if (!s) s = "tag";
  return s;
}

/** Parses comma / semicolon / newline separated tags from admin textarea. */
export function parseTagsInput(raw: string): string[] {
  const labels = raw
    .split(/[,;\n]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 30);
  return [...new Set(labels)];
}

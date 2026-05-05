import { CheckCircle2, AlertCircle } from "lucide-react";

/** Resolves banner from admin settings query params (`?ok=` / `?error=`). */
export function SettingsFlashBanner({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const { ok, error } = searchParams;

  const successMessages: Record<string, string> = {
    hero: "Hero background updated.",
    "hero-clear": "Hero restored to default image.",
    "hero-focus": "Hero focal position saved.",
    logo: "Website logo updated.",
    "logo-clear": "Website logo reset to default.",
    profile: "Profile updated.",
    password: "Password updated.",
  };

  const errorMessages: Record<string, string> = {
    hero: "Hero upload failed — image max 10 MB (JPEG/PNG/WebP); video loops max 45 MB (MP4/WebM/MOV).",
    "hero-focus": "Could not save focal position.",
    logo: "Logo upload failed. Use JPEG, PNG, or WebP under 5 MB.",
  };

  if (error) {
    const known = error in errorMessages ? errorMessages[error] : null;
    return (
      <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900 shadow-sm ring-1 ring-red-500/15">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
        <span>{known ?? "Something went wrong. Try again."}</span>
      </div>
    );
  }

  if (ok !== undefined && ok in successMessages) {
    const msg = successMessages[ok] ?? "";
    return (
      <div className="mb-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50/95 px-4 py-3 text-sm font-medium text-emerald-950 shadow-sm ring-1 ring-emerald-500/15">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
        <span>{msg}</span>
      </div>
    );
  }

  return null;
}

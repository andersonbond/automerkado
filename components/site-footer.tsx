import Image from "next/image";
import Link from "next/link";
import { isPublicUploadPath } from "@/lib/nextImage";
import { getSiteLogoSrc } from "@/lib/siteLogo";

const links = [
  { href: "/listings/certified", label: "Certified" },
  { href: "/listings/repossessed", label: "Repossessed" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
  { href: "/privacy", label: "Privacy policy" },
] as const;

export async function SiteFooter() {
  const logoSrc = await getSiteLogoSrc();
  return (
    <footer className="mt-auto border-t border-white/10 bg-inverse text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-lg font-bold tracking-tight text-white"
            >
              <span className="relative block h-10 w-10 shrink-0">
                <Image
                  src={logoSrc}
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-contain object-left"
                  sizes="40px"
                  unoptimized={isPublicUploadPath(logoSrc)}
                />
              </span>
              Automerkado
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              Certified and repossessed vehicles with transparent weekly bidding — clear photos,
              specs, and Manila-time bidding windows.
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-10 gap-y-3 text-sm font-medium text-white/80"
          >
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-12 border-t border-white/10 pt-8 text-xs text-white/45">
          © {new Date().getFullYear()} Automerkado. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

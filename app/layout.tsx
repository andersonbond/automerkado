import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { absoluteUrl, siteUrlObject } from "@/lib/site";
import { DEFAULT_FAVICON, getSiteLogoSrc } from "@/lib/siteLogo";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f8" },
    { media: "(prefers-color-scheme: dark)", color: "#07080c" },
  ],
};

function appleTouchIcon(logoPath: string) {
  if (logoPath.endsWith(".webp")) {
    return { url: "/logo.jpeg" as const, type: "image/jpeg" as const, sizes: "180x180" as const };
  }
  if (logoPath.endsWith(".png")) {
    return { url: logoPath, type: "image/png" as const, sizes: "180x180" as const };
  }
  return {
    url: logoPath,
    type: "image/jpeg" as const,
    sizes: "180x180" as const,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const logoPath = await getSiteLogoSrc();
  const ogImageUrl = absoluteUrl(logoPath);

  return {
    metadataBase: siteUrlObject(),
    title: {
      default:
        "Automerkado · Certified & repossessed vehicles in the Philippines",
      template: "%s | Automerkado",
    },
    description:
      "Browse certified pre-owned and repossessed cars in the Philippines. Clear specs, weekly bidding (Manila time), and inspection requests—all in one place.",
    keywords: [
      "used cars Philippines",
      "certified pre-owned Philippines",
      "repossessed cars Philippines",
      "car bidding Philippines",
      "pre-owned vehicles Manila",
      "automotive marketplace Philippines",
    ],
    applicationName: "Automerkado",
    referrer: "origin-when-cross-origin",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [{ url: DEFAULT_FAVICON, type: "image/svg+xml" }],
      apple: [appleTouchIcon(logoPath)],
    },
    openGraph: {
      type: "website",
      siteName: "Automerkado",
      locale: "en_PH",
      title:
        "Automerkado · Certified & repossessed vehicles in the Philippines",
      description:
        "Browse certified pre-owned and repossessed cars. Weekly bidding on Manila time, transparent specs, and inspection requests.",
      images: [
        {
          url: ogImageUrl,
          width: 512,
          height: 512,
          alt: "Automerkado",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Automerkado",
      description:
        "Certified & repossessed vehicles in the Philippines. Browse, bid, and request inspections.",
      images: [ogImageUrl],
    },
    formatDetection: {
      email: false,
      telephone: false,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-PH" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

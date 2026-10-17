import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { appUrl } from "@/lib/env";
import { SITE } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${SITE.fullName} — ${SITE.role}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.tagline,
  keywords: [
    "portfolio",
    "fullstack developer",
    "game developer",
    "UI UX designer",
    "Next.js",
    "Unity",
    SITE.name,
  ],
  authors: [{ name: SITE.fullName }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: SITE.name,
    title: `${SITE.fullName} — ${SITE.role}`,
    description: SITE.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.fullName} — ${SITE.role}`,
    description: SITE.tagline,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${grotesk.variable} ${jetbrains.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-void font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

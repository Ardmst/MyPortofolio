import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { siteUrl } from "@/lib/env";
import { SITE_ICONS } from "@/lib/constants";
import "../globals.css";

/**
 * Root layout for `/admin/**`.
 *
 * The app has two root layouts: this one (the CMS: Tailwind, dark tokens,
 * Inter / Space Grotesk / JetBrains Mono, sonner) and `src/app/(site)/layout.tsx`
 * (the public site: `src/styles/theme.css`, Bebas Neue / EB Garamond). Nothing
 * here is loaded by a public page, and nothing public is loaded here.
 */

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
  metadataBase: new URL(siteUrl),
  title: "Admin CMS | Ardmst",
  robots: { index: false, follow: false },
  icons: SITE_ICONS,
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${grotesk.variable} ${jetbrains.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-void font-sans antialiased">
        <div className="min-h-dvh bg-void">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}

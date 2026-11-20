import type { Metadata } from "next";
import { Bebas_Neue, EB_Garamond } from "next/font/google";
import { siteUrl } from "@/lib/env";
import { SITE, SITE_ICONS } from "@/lib/constants";
import { Bar } from "@/components/site/Bar";
import { SheetKit } from "@/components/site/SheetKit";
import "@/styles/theme.css";
import "@/styles/sheet-kit.css";
import "@/styles/site.css";

/**
 * Root layout for the public site.
 *
 * It loads only the shared theme (`src/styles/theme.css`), the shared sheet
 * kit's styles (`src/styles/sheet-kit.css`), both verbatim copies of the
 * workspace's `shared/` files, and then this site's own rules
 * (`src/styles/site.css`). No Tailwind, no admin CSS, no admin fonts: those
 * belong to the other root layout, `src/app/admin/layout.tsx`.
 *
 * The bar is here, so every public page has it. `<SheetKit />` mounts the
 * pointer layer once for the whole visit.
 */

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const text = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-text",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE.title,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.fullName, url: SITE.hubUrl }],
  creator: SITE.fullName,
  // "./" resolves against each route's own path, so every public page gets
  // its own canonical without repeating this block.
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "./",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  // No explicit `twitter` block: Next.js derives the card from Open Graph and
  // upgrades it to a large image card once an `opengraph-image` exists.
  robots: { index: true, follow: true },
  icons: SITE_ICONS,
};

/**
 * Runs before first paint:
 *  - marks the document as scripted (`.js`), so entrances only hide content
 *    when script is really running;
 *  - applies the visitor's stored theme. White is the default; the OS
 *    preference is deliberately not followed.
 */
const BOOT_SCRIPT =
  '(function(){var d=document.documentElement;d.classList.add("js");' +
  'try{if(localStorage.getItem("ardmst-theme")==="dark")d.setAttribute("data-theme","dark")}catch(e){}})();';

export default function SiteRootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `data-scroll-behavior`: theme.css scrolls smoothly inside a page; a change of
    // page still jumps to the top at once (Next.js 16 asks for this attribute).
    <html
      lang="en"
      className={`${display.variable} ${text.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        <Bar />
        {children}
        <SheetKit />
      </body>
    </html>
  );
}

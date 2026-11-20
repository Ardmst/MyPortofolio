import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

/** /robots.txt — the public site is open; the CMS and the JSON API are not for crawlers. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

/**
 * Public, indexable pages, as paths. Add a page here when it gets a route
 * under `src/app/(site)/` (for example "/play/detektif").
 */
const PUBLIC_PATHS = ["/", "/play/detektif"] as const;

/** /sitemap.xml */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? siteUrl : `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}

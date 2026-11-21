import { SHARE_ALT, shareImage } from "@/components/site/ShareImage";

/** /opengraph-image: the picture a shared link shows. Built once, with the site. */
export const alt = SHARE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return shareImage();
}

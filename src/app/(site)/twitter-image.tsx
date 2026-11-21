import { SHARE_ALT, shareImage } from "@/components/site/ShareImage";

/** /twitter-image: the same picture as the Open Graph one, for the large Twitter card. */
export const alt = SHARE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return shareImage();
}

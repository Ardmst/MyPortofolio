import type { Picture } from "@/content/pictures";

interface PicProps {
  picture: Picture;
  /** `sizes` for the `srcset`, when the picture has smaller renditions. */
  sizes?: string;
  /** Only for the first picture of the page: loaded at once, with high priority. */
  eager?: boolean;
  className?: string;
  /** Use when a caption or heading beside the picture already says what it is. */
  decorative?: boolean;
}

/**
 * One picture in the house treatment: a square-cornered frame (`.pic` from
 * theme.css) that the image covers, with its real width and height so nothing
 * shifts while it loads. The files are already cropped and sized by
 * `scripts/pictures.mjs`; no optimiser runs at request time.
 */
export function Pic({ picture, sizes, eager = false, className, decorative = false }: PicProps) {
  const srcSet = picture.smaller
    ? [...picture.smaller, picture].map((file) => `${file.src} ${file.width}w`).join(", ")
    : undefined;

  return (
    <div className={["pic", picture.pixel ? "pic--pixel" : "", className ?? ""].filter(Boolean).join(" ")}>
      <img
        src={picture.src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        width={picture.width}
        height={picture.height}
        alt={decorative ? "" : picture.alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
      />
    </div>
  );
}

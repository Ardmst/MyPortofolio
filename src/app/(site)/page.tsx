import { Hero } from "@/components/site/Hero";
import { About, Close, Contact, MoreWork } from "@/components/site/Rest";
import { Work } from "@/components/site/Work";

/**
 * The home page. It is static: built once and, because the KicauScore block
 * reads that site's public standings, rebuilt in the background at most every
 * ten minutes (see `components/site/Standings.tsx`).
 */
export const revalidate = 600;

export default function HomePage() {
  return (
    <>
      <main id="top">
        <Hero />
        <Work />
        <About />
        <MoreWork />
        <Contact />
      </main>
      <Close />
    </>
  );
}

"use client";

import { useEffect } from "react";

/**
 * The hero's pin observer. While the hero is pinned (site.css decides that:
 * script on, full motion, a screen tall enough) it tells the stylesheet which
 * sheet has docked under the monument:
 *
 *  - `data-step="n"` on the hero: the band takes that sheet's ground and ink;
 *  - `data-biro-ink` on the band: the biro point stays visible on dark grounds;
 *  - `data-under` on every sheet that is fully covered: it stops painting and
 *    its button leaves the tab order.
 *
 * It only reads five rectangles per frame while the page scrolls, and writes
 * when the step changes. When the hero is not pinned it removes its marks.
 */
export function HeroPin() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const band = hero?.querySelector<HTMLElement>(".hero__band");
    const leaves = hero ? Array.from(hero.querySelectorAll<HTMLElement>(".hero__leaf")) : [];
    if (!hero || !band || !leaves.length) return;

    let frame = 0;
    let shown: number | null = null;

    const read = () => {
      frame = 0;
      const style = getComputedStyle(leaves[0]);
      let step = -1; // not pinned
      if (style.position === "sticky") {
        const line = (parseFloat(style.top) || 0) + 1;
        step = 0;
        leaves.forEach((leaf, i) => {
          if (i && leaf.getBoundingClientRect().top <= line) step = i;
        });
      }
      if (step === shown) return;
      shown = step;

      if (step < 0) hero.removeAttribute("data-step");
      else hero.dataset.step = String(step);

      const ink = step < 0 ? undefined : leaves[step].dataset.biroInk;
      if (ink) band.dataset.biroInk = ink;
      else band.removeAttribute("data-biro-ink");

      leaves.forEach((leaf, i) => leaf.toggleAttribute("data-under", step >= 0 && i < step));
    };
    const ask = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    read();
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask, { passive: true });
    calm.addEventListener("change", ask);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", ask);
      window.removeEventListener("resize", ask);
      calm.removeEventListener("change", ask);
      hero.removeAttribute("data-step");
      band.removeAttribute("data-biro-ink");
      leaves.forEach((leaf) => leaf.removeAttribute("data-under"));
    };
  }, []);

  return null;
}

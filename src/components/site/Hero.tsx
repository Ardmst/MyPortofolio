import type { CSSProperties } from "react";
import { HERO } from "@/content/site";
import { HeroPin } from "@/components/site/HeroPin";
import { Pic } from "@/components/site/Pic";

/**
 * The hero: "Pinned title over portraits".
 *
 * The monument (the page's h1) is pinned at the top of the screen while the
 * portraits arrive beneath it, one sheet of flat colour each. A sheet docks
 * under the letters' feet and covers the one before it, so no picture ever
 * passes behind the name; the band the name stands on takes the ground and the
 * ink of the sheet that has docked (`data-step`, set by `<HeroPin />`).
 *
 * Without script, or with reduced motion, nothing is pinned: the name stands
 * on the page ground and the sheets simply stack (site.css).
 *
 * `--g0…` / `--i0…` carry each step's ground and ink to the stylesheet, so the
 * portraits stay data (`content/site.ts`) and the observer only sets a number.
 */
export function Hero() {
  const steps = HERO.portraits;
  const palette: Record<string, string> = {};
  steps.forEach((step, i) => {
    palette[`--g${i}`] = step.ground ?? "transparent";
    palette[`--i${i}`] = step.ink;
  });

  return (
    <section className="hero" data-hero style={palette as CSSProperties}>
      {/* The rail ends one sheet above the foot of the hero, so the band lets go
          together with the last sheet instead of staying behind it. */}
      <div className="hero__rail">
        <div className="hero__band">
          <h1 className="monument hero__name">{HERO.name}</h1>
        </div>
      </div>

      {steps.map((step, i) => {
        const first = i === 0;
        const field = step.ground ? ({ "--field": step.ground, "--field-ink": step.ink } as CSSProperties) : undefined;
        return (
          <div
            key={step.picture.src}
            className={["hero__leaf", step.ground ? "field" : "", first ? "hero__leaf--first" : ""].filter(Boolean).join(" ")}
            style={field}
            data-biro-ink={step.biroInk}
          >
            {first ? (
              <>
                <p className="lead hero__say">{HERO.sentence}</p>
                <a className="button hero__go" href={HERO.action.href}>
                  {HERO.action.label}
                </a>
              </>
            ) : null}
            <figure className="hero__fig">
              <Pic
                picture={step.picture}
                className="hero__pic"
                sizes="(max-width: 899px) 92vw, 30vw"
                eager={first}
              />
              <figcaption className="small hero__cap">{step.caption}</figcaption>
            </figure>
          </div>
        );
      })}

      <HeroPin />
    </section>
  );
}

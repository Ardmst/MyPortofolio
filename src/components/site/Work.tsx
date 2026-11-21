import type { CSSProperties } from "react";
import Link from "next/link";
import { WORK_HEADING } from "@/content/site";
import { FEATURED, type FeaturedProject } from "@/content/work";
import type { Picture } from "@/content/pictures";
import { Game, GameNote, GamePlay, GameStage } from "@/components/site/Game";
import { Pic } from "@/components/site/Pic";
import { Standings } from "@/components/site/Standings";

/**
 * Work: "Oversized visual, small cluster", one block per entry of FEATURED.
 *
 * Each block is the same five parts on one grid (site.css, `.project`):
 * the oversized visual bleeding off the left edge, the small cluster at its
 * foot on the right (a 16:10 picture, the title, the kind line), then the
 * description, the facts, and the action. What changes from block to block
 * comes from the data: the proportion of the visual, whether it is a picture
 * or an interface capture on the colour field of the project, and how the
 * work opens (a game that runs in the block, or a live site).
 */
export function Work() {
  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <h2 className="work__title" id="work-title" data-rise="">
        {WORK_HEADING}
      </h2>
      {FEATURED.map((project) => (
        <Project key={project.slug} project={project} />
      ))}
    </section>
  );
}

/** An interface capture set into a colour field: inset at the top and left, running off the far edges. */
function Shot({
  picture,
  variant,
  field,
  biroInk,
}: {
  picture: Picture;
  variant?: "tall" | "small";
  /** A ground of its own, when it is not the project's. */
  field?: string;
  biroInk?: string;
}) {
  return (
    <div
      className={["shot", variant ? `shot--${variant}` : "", "field"].filter(Boolean).join(" ")}
      style={field ? ({ "--field": field } as CSSProperties) : undefined}
      data-biro-ink={biroInk}
    >
      <img
        src={picture.src}
        width={picture.width}
        height={picture.height}
        alt={picture.alt}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function Project({ project }: { project: FeaturedProject }) {
  const { live, visual } = project;
  const titleId = `work-${project.slug}`;
  const style = { "--field": project.field, "--project-ratio": visual.ratio } as CSSProperties;
  const onField = visual.frame === "field";

  /* What a wide screen shows: the game stage, or the wide picture. */
  const wide =
    live.kind === "game" ? (
      <div className="project__wide">
        <GameStage
          src={live.src}
          frameTitle={live.frameTitle}
          playLabel={live.play}
          poster={visual.wide}
          clip={live.clip}
        />
        <GameNote
          className="project__cap"
          before={visual.wideCaption}
          loading={live.loading}
          controls={live.controls}
          restart={live.restart}
        />
      </div>
    ) : (
      <figure className="project__wide">
        {onField ? (
          <Shot picture={visual.wide} biroInk={project.biroInk} />
        ) : (
          <Pic picture={visual.wide} className="project__flush" />
        )}
        <figcaption className="small project__cap">{visual.wideCaption}</figcaption>
      </figure>
    );

  /* The upright picture a touch screen shows instead. */
  const tall = (
    <figure className="project__tall">
      {onField ? (
        <Shot picture={visual.tall} biroInk={project.biroInk} variant="tall" />
      ) : (
        <Pic picture={visual.tall} className="project__flush" />
      )}
      <figcaption className="small project__cap">{visual.tallCaption}</figcaption>
    </figure>
  );

  const parts = (
    <>
      <div className={live.kind === "game" ? "project__visual project__visual--game" : "project__visual"} data-rise="open">
        {wide}
        {tall}
      </div>

      <div className="project__cluster">
        <div data-rise="open" data-rise-i="1">
          {project.clusterField ? (
            <Shot picture={project.cluster} variant="small" field={project.clusterField} />
          ) : (
            <Pic picture={project.cluster} className="project__small" />
          )}
        </div>
        <h3 className="project__title" id={titleId} data-rise="" data-rise-i="2">
          {project.title}
        </h3>
        <p className="project__kind" data-rise="" data-rise-i="3">
          {project.kind} · {project.year} · {project.team}
        </p>
      </div>

      <p className="project__text" data-rise="">
        {project.description}
      </p>

      <div className="project__aside">
        <p className="muted" data-rise="" data-rise-i="1">
          {project.facts}
        </p>
        {live.kind === "site" && live.standings ? (
          <Standings api={live.standings.api} caption={live.standings.caption} />
        ) : null}
      </div>

      <div className="project__actions" data-rise="" data-rise-i="2">
        {live.kind === "game" ? (
          <>
            <GamePlay label={live.play} />
            <Link className="link if-keys needs-js" href={live.page}>
              {live.full}
            </Link>
            <p className="if-touch">{live.phoneNote}</p>
            <noscript>
              <p className="if-keys">{live.noScript}</p>
            </noscript>
          </>
        ) : (
          <>
            <a className="button" href={live.href} target="_blank" rel="noopener">
              {live.label}
            </a>
            {live.caption ? <p className="small muted">{live.caption}</p> : null}
          </>
        )}
      </div>
    </>
  );

  return (
    <article className="project" style={style} aria-labelledby={titleId}>
      {live.kind === "game" ? <Game>{parts}</Game> : parts}
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Close } from "@/components/site/Close";
import { Game, GameNote, GamePlay, GameStage } from "@/components/site/Game";
import { Pic } from "@/components/site/Pic";
import { PICTURES } from "@/content/pictures";
import { FEATURED } from "@/content/work";

/**
 * /play/detektif: the game on a page of its own, with a large stage.
 * It is static; the game itself loads only on a click, as on the home page.
 * Everything it says comes from the Detektif Ekosistem entry in `content/work.ts`
 * plus the notes below (facts: DESIGN.md §3, Project B).
 */

const project = FEATURED.find((entry) => entry.slug === "detektif-ekosistem");

export const metadata: Metadata = {
  title: "Play Detektif Ekosistem",
  description:
    "Detektif Ekosistem, a pixel-art detective game about the forest fires of Kalimantan, playable in the browser on a computer with a keyboard. Made with Eka.",
  alternates: { canonical: "/play/detektif" },
  openGraph: { url: "/play/detektif", title: "Play Detektif Ekosistem" },
};

const CONTROLS = [
  { keys: "W A S D or the arrow keys", does: "Move" },
  { keys: "E", does: "Talk to a witness, examine a clue" },
  { keys: "Space", does: "Continue the dialogue" },
  { keys: "Esc", does: "Pause" },
  { keys: "Mouse", does: "Menus and choices" },
];

const NOTES = [
  "It needs a keyboard and a mouse: there are no touch controls.",
  "The first load downloads about 48 MB.",
  "The game is in Indonesian.",
  "The EXIT button in the game stops it for good. Press Restart under the game to begin again.",
  "Made with Eka for a multimedia course, in Godot 4.7.",
];

const STAGES = [
  { picture: PICTURES.detektifStages.one, caption: "Stage one: a village and the forest around it." },
  { picture: PICTURES.detektifStages.two, caption: "Stage two: the burnt land, with fires still active." },
  { picture: PICTURES.detektifStages.three, caption: "Stage three: the burnt west side, in the rain." },
];

export default function PlayDetektifPage() {
  if (!project || project.live.kind !== "game") return null;
  const { live, visual } = project;

  return (
    <>
      <main className="play">
        <Game>
          <header className="play__head">
            <div>
              <h1 className="head">{project.title}</h1>
              <p className="lead play__kind">{`${project.kind} · ${project.year} · ${project.team}`}</p>
            </div>
            <GamePlay label={live.play} />
            <Link className="button if-touch" href="/#work" prefetch={false}>
              Back to the work
            </Link>
          </header>

          <div className="play__stage" data-rise="">
            <GameStage
              src={live.src}
              frameTitle={live.frameTitle}
              playLabel={live.play}
              poster={visual.wide}
              clip={live.clip}
            />
            <GameNote
              before={visual.wideCaption}
              loading={live.loading}
              controls={live.controls}
              restart={live.restart}
              fullscreen="Full screen"
            />
            <p className="if-touch play__touch">{live.phoneNote}</p>
          </div>
        </Game>

        <div className="play__notes">
          <section aria-labelledby="play-controls">
            <h2 className="lead" id="play-controls" data-rise="">
              Controls
            </h2>
            <dl className="play__keys">
              {CONTROLS.map((row, i) => (
                <div key={row.keys} data-rise="" data-rise-i={i + 1}>
                  <dt>{row.does}</dt>
                  <dd>{row.keys}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="play-notes">
            <h2 className="lead" id="play-notes" data-rise="">
              Before you start
            </h2>
            <ul className="play__list">
              {NOTES.map((note, i) => (
                <li key={note} data-rise="" data-rise-i={i + 1}>
                  {note}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="play__stills" aria-labelledby="play-stages">
          <h2 className="lead" id="play-stages" data-rise="">
            Three maps to walk
          </h2>
          {STAGES.map((stage, i) => (
            <figure key={stage.picture.src} data-rise="" data-rise-i={i}>
              <Pic picture={stage.picture} className="play__still" decorative />
              <figcaption>{stage.caption}</figcaption>
            </figure>
          ))}
        </section>

        <p className="play__back">
          <Link className="link" href="/#work" prefetch={false}>
            Back to the work
          </Link>
        </p>
      </main>
      <Close />
    </>
  );
}

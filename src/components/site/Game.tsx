"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Picture } from "@/content/pictures";

/**
 * The live thing: a web build that runs on the page.
 *
 * `<Game>` holds the state; `<GameStage>` is the 16:9 box (the resting picture,
 * then the game in an iframe), `<GamePlay>` the button and `<GameNote>` the line
 * under the stage with the Restart control. They can sit anywhere inside one
 * `<Game>`, so a page lays them out as it likes.
 *
 * Rules it keeps (DESIGN.md §3, "The live thing"):
 *  - nothing of the game loads before a click;
 *  - mouse and keyboard only: on touch devices the picture is not a button and
 *    the play button is replaced by a note (`.if-keys` / `.if-touch`, site.css);
 *  - Restart re-creates the iframe, because the game's own EXIT freezes the canvas;
 *  - focus moves into the game when it has loaded;
 *  - it starts in its box. The game asks for the whole screen by itself as soon as it boots, which
 *    the browser grants only if that happens within a few seconds of the click (a warm cache), so
 *    the same button would sometimes fill the screen and sometimes not. That first request is
 *    turned down; any later one, made after a click or a key inside the game, goes through, and
 *    the page can offer its own "Full screen" control.
 */

type Phase = "idle" | "loading" | "running";

interface GameState {
  /** 0 until the first click; each start or restart adds one (and re-creates the iframe). */
  run: number;
  phase: Phase;
  canPlay: boolean;
  play: () => void;
  ready: () => void;
  /** Puts the running game on the whole screen (a click is needed: browsers ask for a gesture). */
  fill: () => void;
  stage: React.RefObject<HTMLDivElement | null>;
  frame: React.RefObject<HTMLIFrameElement | null>;
}

const GameContext = createContext<GameState | null>(null);

function useGame(): GameState {
  const game = useContext(GameContext);
  if (!game) throw new Error("Game parts must be rendered inside <Game>.");
  return game;
}

const KEYS_QUERY = "(hover: hover) and (pointer: fine)";

function watchKeys(onChange: () => void) {
  const query = window.matchMedia(KEYS_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Turns down fullscreen requests made from inside the game until someone has clicked or pressed a
 * key in it. The game's page is same-origin, so its window can be reached; the build's files are
 * served untouched.
 */
function holdFullscreen(frame: HTMLIFrameElement) {
  try {
    const inner = frame.contentWindow as (Window & typeof globalThis) | null;
    if (!inner) return;
    let touched = false;
    const touch = () => {
      touched = true;
    };
    inner.addEventListener("pointerdown", touch, true);
    inner.addEventListener("keydown", touch, true);
    const element = inner.Element.prototype;
    const request = element.requestFullscreen;
    element.requestFullscreen = function (this: Element, options?: FullscreenOptions) {
      if (touched) return request.call(this, options);
      return Promise.reject(new TypeError("Fullscreen waits for a click inside the game."));
    };
  } catch {
    /* the frame cannot be reached: the browser's own gesture rule still applies */
  }
}

/** A mouse or trackpad is the main pointer, so there is very likely a keyboard too. */
function useKeys(): boolean {
  return useSyncExternalStore(
    watchKeys,
    () => window.matchMedia(KEYS_QUERY).matches,
    () => true,
  );
}

export function Game({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const stage = useRef<HTMLDivElement | null>(null);
  const frame = useRef<HTMLIFrameElement | null>(null);
  const canPlay = useKeys();

  const play = useCallback(() => {
    setRun((n) => n + 1);
    setPhase("loading");
    stage.current?.scrollIntoView({ block: "nearest" });
  }, []);
  const ready = useCallback(() => setPhase("running"), []);
  const fill = useCallback(() => {
    const el = frame.current;
    if (!el?.requestFullscreen) return;
    el.requestFullscreen().then(
      () => el.focus(),
      () => {},
    );
  }, []);

  const value = useMemo(
    () => ({ run, phase, canPlay, play, ready, fill, stage, frame }),
    [run, phase, canPlay, play, ready, fill],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

interface GameStageProps {
  /** The build's own HTML page (same origin). */
  src: string;
  /** Accessible name of the running game's frame. */
  frameTitle: string;
  /** Name of the control that starts it, for the picture when it is a button. */
  playLabel: string;
  /** The picture the stage rests on. */
  poster: Picture;
  /** A muted loop of the same art. It only plays while it is on screen. */
  clip?: { webm: string; mp4: string };
}

export function GameStage({ src, frameTitle, playLabel, poster, clip }: GameStageProps) {
  const { run, canPlay, play, ready, stage, frame: frameRef } = useGame();
  const video = useRef<HTMLVideoElement | null>(null);
  const watch = useRef<number | null>(null);

  // The loop plays only while it is in view, never with reduced motion or Save-Data.
  useEffect(() => {
    const el = video.current;
    if (!el || run) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (calm || saving || !("IntersectionObserver" in window)) return;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 },
    );
    seen.observe(el);
    return () => seen.disconnect();
  }, [run]);

  useEffect(
    () => () => {
      if (watch.current) window.clearInterval(watch.current);
    },
    [],
  );

  // The game's page is same-origin: give it the keyboard, and notice when the engine has started
  // (Godot removes its #status overlay then).
  const onLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const frame = event.currentTarget;
    holdFullscreen(frame);
    frame.focus();
    if (watch.current) window.clearInterval(watch.current);
    watch.current = window.setInterval(() => {
      try {
        const doc = frame.contentDocument;
        if (!frame.isConnected || !doc) throw new Error("gone");
        if (doc.getElementById("status")) return;
        doc.getElementById("canvas")?.focus();
        ready();
      } catch {
        /* the frame was replaced or cannot be read: stop watching */
      }
      if (watch.current) window.clearInterval(watch.current);
      watch.current = null;
    }, 400);
  };

  const picture = clip ? (
    <video
      ref={video}
      className="stage__clip"
      width={poster.width}
      height={poster.height}
      poster={poster.src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    >
      <source src={clip.webm} type="video/webm" />
      <source src={clip.mp4} type="video/mp4" />
    </video>
  ) : (
    <img src={poster.src} width={poster.width} height={poster.height} alt="" loading="lazy" decoding="async" />
  );

  return (
    <div className="stage" ref={stage} data-running={run ? "" : undefined}>
      {run ? (
        // data-ui: a real interface from here on; the biro steps aside.
        <div className="stage__box" data-ui="">
          <iframe
            key={run}
            ref={frameRef}
            className="stage__frame"
            src={src}
            title={frameTitle}
            allow="fullscreen; autoplay; gamepad"
            onLoad={onLoad}
          />
        </div>
      ) : canPlay ? (
        <button
          type="button"
          className="stage__box stage__still"
          onClick={play}
          data-biro="label"
          data-biro-label="Play"
          aria-label={`${playLabel}: ${frameTitle}`}
        >
          {picture}
        </button>
      ) : (
        <div className="stage__box stage__still" role="img" aria-label={poster.alt}>
          {picture}
        </div>
      )}
    </div>
  );
}

/** The play button. It leaves once the game has been started: Restart takes over. */
export function GamePlay({ label, className }: { label: string; className?: string }) {
  const { run, play } = useGame();
  if (run) return null;
  return (
    <button type="button" className={["button", "if-keys", className ?? ""].filter(Boolean).join(" ")} onClick={play}>
      {label}
    </button>
  );
}

interface GameNoteProps {
  /** Before anything is loaded: what the resting picture is. */
  before: string;
  loading: string;
  controls: string;
  restart: string;
  /** Label of a control that puts the running game on the whole screen. Leave out for none. */
  fullscreen?: string;
  className?: string;
}

/** The line under the stage: what it shows, then the loading note and the controls, with Restart. */
export function GameNote({ before, loading, controls, restart, fullscreen, className }: GameNoteProps) {
  const { run, phase, play, fill } = useGame();
  return (
    <div className={["small", "stage__note", className ?? ""].filter(Boolean).join(" ")}>
      <p role="status">{phase === "idle" ? before : phase === "loading" ? loading : controls}</p>
      {run ? (
        <span className="stage__controls">
          {fullscreen ? (
            <button type="button" className="link" onClick={fill}>
              {fullscreen}
            </button>
          ) : null}
          <button type="button" className="link stage__restart" onClick={play}>
            {restart}
          </button>
        </span>
      ) : null}
    </div>
  );
}

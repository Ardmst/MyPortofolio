/**
 * ardmst sheet kit: types for sheet-kit.js (the "sheet and biro" interaction layer).
 * Copy VERBATIM next to sheet-kit.js. Usage and pitfalls: README.md.
 *
 * Every init is safe on the server (returns a no-op), safe when its targets are missing,
 * and counted: calling it twice mounts one instance, and the instance is removed when
 * the last cleanup has run (React strict-mode double mounting is harmless).
 */

/** Undoes one init call. Calling it more than once does nothing. */
export type Cleanup = () => void;

/**
 * The theme word in the bar. Wires every `[data-theme-toggle]` button (delegated click):
 * toggles `<html data-theme="dark">`, stores `"dark"` / `"light"` in
 * `localStorage["ardmst-theme"]`, and keeps the button's text ("Dark" while light is
 * showing, "Light" while dark is showing) and `aria-pressed` in step. Light is the
 * default whatever the OS prefers. If the button holds a `[data-theme-label]` element,
 * only that element's text is changed.
 */
export function initTheme(): Cleanup;

/**
 * Entrances. Adds `is-in` once to each `[data-rise]` when it comes into view (the CSS is
 * in theme.css). The stagger index is `--i`, set in `style` or with `data-rise-i="2"`.
 * Elements added later are picked up too.
 */
export function initRise(): Cleanup;

/**
 * The sheet. Appends one `<canvas class="sheet">` to `<body>`, fixed behind the content,
 * and adds `has-sheet` to `<html>`. On a mouse or trackpad the dots wake under the
 * pointer; on touch and under reduced motion the grid is drawn once and left alone.
 * Colours are read again when `data-theme` changes.
 */
export function initSheet(): Cleanup;

/**
 * The biro. Appends one follower (`<div class="biro">`) to `<body>` and resolves its
 * state from the element under the pointer:
 * - `data-biro="preview"` + `data-biro-src` (+ `data-biro-alt`, `data-biro-ratio="16 / 9"`):
 *   the held picture frame; also shown beside the target on keyboard focus;
 * - `data-biro="label"` + `data-biro-label="Play"`: a disc with the word;
 * - plain `a` / `button`: the point swells;
 * - `iframe`, `[data-ui]`, `data-biro="off"`: the point steps aside;
 * - `data-biro-ink="#fff"` on a field: the point's colour while it is over that field.
 */
export function initBiro(): Cleanup;

/**
 * The monument. Splits the text of every `.monument` (and `[data-monument]`) into letter
 * spans and lets letters near the pointer lean away, transform only. Mouse or trackpad
 * and full motion only; otherwise the element is left untouched. Cleanup restores the text.
 */
export function initMonument(): Cleanup;

/** All five, in order: theme, rise, sheet, biro, monument. */
export function initAll(): Cleanup;

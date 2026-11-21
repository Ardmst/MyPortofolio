import { CLOSE } from "@/content/site";

/**
 * The close: "Invitation over a cropped name". The same close as the hub's.
 *
 * A whole field of the inverse colour (deep blue in the dark theme): the
 * invitation and its one button, a few links, then the name the handle comes
 * from with the letters it dropped in the soft ink, the legal row, and the
 * monument again, cut by the bottom edge. The field, the legal row and the
 * cropped name come from theme.css (`.close`); the rest is in site.css.
 *
 * The cropped name is plain text, so the sheet kit can split it into letters;
 * it repeats the page's h1, so it is hidden from assistive technology.
 */
export function Close() {
  return (
    <footer className="close" data-biro-ink="var(--field-1-ink)">
      <div className="close__top">
        <div className="close__ask">
          <h2 className="close__say" data-rise="">
            {CLOSE.invitation}
          </h2>
          {/* The entrance is on the wrapper, so the button keeps its own press and hover timing. */}
          <p className="close__act" data-rise="" data-rise-i="1">
            <a className="button close__go" href={CLOSE.action.href}>
              {CLOSE.action.label}
            </a>
          </p>
        </div>
        <ul className="close__links">
          {CLOSE.links.map((link, i) => (
            <li key={link.href} data-rise="" data-rise-i={i + 1}>
              <a href={link.href} {...(link.newTab ? { target: "_blank", rel: "noopener" } : {})}>
                {link.label}
                {link.newTab ? <span className="sr-only"> (opens in a new tab)</span> : null}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="close__foot">
        <p className="close__derive" data-rise="">
          <span className="sr-only">{CLOSE.fullName}</span>
          <span aria-hidden="true">
            {CLOSE.derivation.map((part) =>
              part.kept ? (
                part.text
              ) : (
                <span key={part.text} className="close__drop">
                  {part.text}
                </span>
              ),
            )}
          </span>
        </p>
        <div className="close__legal">
          <span>{CLOSE.legal.left}</span>
          <span>{CLOSE.legal.right}</span>
        </div>
        <p className="monument" aria-hidden="true">
          {CLOSE.name}
        </p>
      </div>
    </footer>
  );
}

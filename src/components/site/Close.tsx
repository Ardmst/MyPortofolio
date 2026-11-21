import { CLOSE } from "@/content/site";

/**
 * The close: "Invitation over a cropped name". The same close as the hub's.
 *
 * A whole field of the inverse colour (deep blue in the dark theme): the
 * invitation and its one button, a few links, then the name the handle comes
 * from with the letters it dropped in the soft ink, the legal row, and the
 * monument again, fitted to the width and cut by the bottom edge. Every rule
 * of it is in theme.css (`.close`), with this markup; site.css adds none.
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
          <a
            className="button"
            href={CLOSE.action.href}
            data-biro-ink="var(--field-1)"
            data-rise=""
            data-rise-i="1"
          >
            {CLOSE.action.label}
          </a>
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

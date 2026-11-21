import { CONTACT, CONTACT_SECTION } from "@/content/site";

/**
 * Contact: "Address in display rows".
 *
 * The greeting row comes first and is the section's heading: two words at the
 * display size with a round arrow button beside them that writes the mail (on
 * a phone the row is a band of the accent with the button at its far end).
 * Under it every address is a full-width row at the same size and a link, with
 * a few words at the far end saying what is behind it. The rows are told apart
 * by two flat tones (theme.css, `.rows` / `.row`; this site's part is `.contact`).
 */
export function Contact() {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="contact__hello">
        <h2 className="contact__title" id="contact-title" data-rise="">
          {CONTACT_SECTION.greeting}
        </h2>
        {/* The entrance is on a wrapper, so the button keeps its own press and hover timing. */}
        <span className="contact__arrive" data-rise="" data-rise-i="2">
          <a className="contact__go" href={CONTACT.mailto} aria-label={CONTACT_SECTION.write}>
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
              <path d="M3 12h17M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            </svg>
          </a>
        </span>
      </div>

      <address className="rows contact__rows">
        {CONTACT_SECTION.rows.map((row) => (
          <a
            key={row.href}
            className="row"
            href={row.href}
            {...("newTab" in row && row.newTab ? { target: "_blank", rel: "noopener" } : {})}
          >
            <span className="row__name" data-rise="">
              {row.label}
            </span>
            <span className="row__note" data-rise="" data-rise-i="1">
              {row.note}
              {"newTab" in row && row.newTab ? <span className="sr-only"> (opens in a new tab)</span> : null}
            </span>
          </a>
        ))}
      </address>
    </section>
  );
}

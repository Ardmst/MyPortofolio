import { ABOUT, CLOSE, CONTACT_SECTION, LIST } from "@/content/site";
import { MORE_WORK, TOOLBOX } from "@/content/work";

/**
 * PLACEHOLDERS for the second half of the page: About, the list (More work and
 * Toolbox), Contact and the close. They carry the full, final copy and working
 * links from `content/`, in plain markup on the shared theme classes, so the
 * page is complete and readable today. They are NOT designed yet.
 *
 * Stage B replaces each with its blueprint from the direction sheet:
 *   about   → "Portrait as drop cap"          (ABOUT.portrait is ready, square)
 *   list    → "Line-up at one type size"      (previews in MORE_WORK[n].preview)
 *   contact → "Address in display rows"
 *   close   → "Invitation over a cropped name"
 * and moves them into files of their own. The only rules of theirs in
 * site.css are under "placeholders" at the end of that file.
 */

export function About() {
  return (
    <section className="rest rest--about" id="about" aria-labelledby="about-title">
      <div className="rest__side">
        <h2 className="lead rest__label" id="about-title">
          {ABOUT.heading}
        </h2>
        <dl className="rest__facts">
          {ABOUT.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="muted">{fact.label}</dt>
              <dd>{"href" in fact ? <a className="link" href={fact.href}>{fact.value}</a> : fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="rest__main">
        <p className="lead">
          <strong>{ABOUT.name}</strong> {ABOUT.statement}
        </p>
        <p className="lead muted">{ABOUT.second}</p>
      </div>
    </section>
  );
}

export function MoreWork() {
  return (
    <section className="rest rest--list" id="more" aria-labelledby="more-title">
      <table className="rest__table">
        <caption>
          <h2 className="lead rest__label" id="more-title">
            {LIST.more}
          </h2>
        </caption>
        <tbody>
          {MORE_WORK.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <a className="link" href={row.href} rel="noopener">
                  {row.name}
                </a>
              </th>
              <td>{row.kind}</td>
              <td>{row.builtWith}</td>
              <td className="tabular">{row.year}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="rest__table">
        <caption>
          <h2 className="lead rest__label">{LIST.toolbox}</h2>
        </caption>
        <tbody>
          {TOOLBOX.map((row) => (
            <tr key={row.tool}>
              <th scope="row">{row.tool}</th>
              <td>{row.usedFor}</td>
              <td>{row.where}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function Contact() {
  return (
    <section className="rest rest--contact" id="contact" aria-labelledby="contact-title">
      <h2 className="rest__greeting" id="contact-title">
        {CONTACT_SECTION.greeting}
      </h2>
      <div className="rows">
        {CONTACT_SECTION.rows.map((row) => (
          <a key={row.href} className="row" href={row.href} rel="noopener">
            <span className="row__name">{row.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function Close() {
  return (
    <footer className="close" data-biro-ink="var(--field-1-ink)">
      <div className="rest__close">
        <p className="display rest__invite">{CLOSE.invitation}</p>
        <a className="button button--paper" href={CLOSE.action.href}>
          {CLOSE.action.label}
        </a>
        <ul className="rest__links">
          {CLOSE.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} rel="noopener">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="display rest__derivation">
          <span className="sr-only">Ardi Mustaqim</span>
          {CLOSE.derivation.map((part) => (
            <span key={part.text} className={part.kept ? undefined : "rest__dropped"} aria-hidden="true">
              {part.text}
            </span>
          ))}
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

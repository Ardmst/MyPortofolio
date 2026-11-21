import { ABOUT } from "@/content/site";

/**
 * About: "Portrait as drop cap".
 *
 * One statement paragraph that begins with his name, with the square portrait
 * floated at its start and four lines tall, the way a drop capital stands at
 * the head of a chapter. A second paragraph follows in the soft ink. The
 * section's name and three facts are a quiet column of their own, on the left
 * of a wide screen and under the text on a narrow one (site.css, `.about`).
 */
export function About() {
  const { portrait } = ABOUT;

  return (
    <section className="about" id="about" aria-labelledby="about-title">
      <div className="about__side">
        <h2 className="about__title" id="about-title" data-rise="">
          {ABOUT.heading}
        </h2>
        <dl className="about__facts">
          {ABOUT.facts.map((fact, i) => (
            <div key={fact.label} data-rise="" data-rise-i={i + 1}>
              <dt className="small muted">{fact.label}</dt>
              <dd>
                {"href" in fact ? (
                  <a className="link" href={fact.href}>
                    {fact.value}
                  </a>
                ) : (
                  fact.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="about__text">
        <p className="lead about__statement" data-rise="">
          <span className="pic about__cap">
            <img
              src={portrait.src}
              width={portrait.width}
              height={portrait.height}
              alt={portrait.alt}
              loading="lazy"
              decoding="async"
            />
          </span>
          <strong className="about__name">{ABOUT.name}</strong> {ABOUT.statement}
        </p>
        <p className="lead about__second" data-rise="" data-rise-i="2">
          {ABOUT.second}
        </p>
      </div>
    </section>
  );
}

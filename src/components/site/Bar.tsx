import Link from "next/link";
import { BAR } from "@/content/site";

/**
 * The bar: the wordmark (to the hub), three plain links and the theme word.
 * No chrome. It sits at the top of the page and scrolls away with it.
 *
 * The theme button carries both words and theme.css shows one ("Dark" while
 * light shows, "Light" while dark shows), so the word is right before any
 * script runs and the button's name is always the word on screen. The sheet
 * kit only handles the click.
 */
export function Bar() {
  return (
    <header className="bar">
      <a className="bar__mark" href={BAR.mark.href}>
        {BAR.mark.label}
      </a>
      <nav className="bar__links" aria-label="Sections">
        {BAR.links.map((link) => (
          // No prefetch: from another page it would fetch the home page, and its first picture, unasked.
          <Link key={link.href} href={link.href} prefetch={false}>
            {link.label}
          </Link>
        ))}
        <button className="bar__theme" type="button" data-theme-toggle>
          <span className="bar__to-dark">Dark</span>
          <span className="bar__to-light">Light</span>
        </button>
      </nav>
    </header>
  );
}

import { LIST } from "@/content/site";
import { MORE_WORK, TOOLBOX } from "@/content/work";

/**
 * The list: "Line-up at one type size".
 *
 * One table on a whole field of the light blue, every cell at one size and one
 * weight: the name on the margin, then what it is, what it was built with and
 * the year at the far edge. Two parts, each opened by its own line: "More work"
 * (every row is a link to the live page or the repository) and "Toolbox".
 *
 * How a row is built (site.css, `.lineup`):
 *  - the table's elements are laid out with CSS grid, on the page's twelve columns, so the
 *    explicit `role`s keep it a table for assistive technology in every browser;
 *  - in a linked row the first cell spans the whole row and its link fills it, so the row is
 *    one target; the other cells let the pointer through. The link carries the biro preview
 *    (`data-biro="preview"`, `data-biro-place="gap"`): the held picture stays inside the row,
 *    in the free stretch between the name and the cells, and covers no other row;
 *  - from 600px the name with the other two cells as a pair of lines beside it; on a phone, the
 *    name with its year, then the other cells under it.
 */

/** Rows of one part arrive one after another; the theme's stagger is 75 ms a step. */
const step = (index: number) => Math.min(index + 1, 5);

export function LineUp() {
  return (
    <section className="lineup" id="more" aria-labelledby="more-title">
      <table className="lineup__table" role="table">
        <tbody role="rowgroup">
          <tr className="lineup__part" role="row">
            <td role="cell" colSpan={4}>
              <h2 id="more-title" data-rise="">
                {LIST.more}
              </h2>
            </td>
          </tr>
          <tr className="sr-only" role="row">
            {LIST.columns.more.map((name) => (
              <th key={name} role="columnheader" scope="col">
                {name}
              </th>
            ))}
          </tr>
          {MORE_WORK.map((row, i) => (
            <tr key={row.name} className="lineup__row lineup__row--link" role="row" data-rise="" data-rise-i={step(i)}>
              <th className="lineup__name" role="rowheader" scope="row">
                <a
                  href={row.href}
                  target="_blank"
                  rel="noopener"
                  {...(row.preview
                    ? {
                        "data-biro": "preview",
                        "data-biro-place": "gap",
                        "data-biro-src": row.preview.src,
                        "data-biro-alt": row.preview.alt,
                        "data-biro-ratio": `${row.preview.width} / ${row.preview.height}`,
                      }
                    : {})}
                >
                  <span className="lineup__label">{row.name}</span>
                  {/* Also the far end of the stretch the held picture may take (site.css, `.lineup__goes`). */}
                  <span className="sr-only lineup__goes">, {LIST.goes[row.linkKind]}</span>
                </a>
              </th>
              <td className="lineup__what" role="cell">
                {row.kind}
              </td>
              <td className="lineup__with" role="cell">
                {row.builtWith}
              </td>
              <td className="lineup__year tabular" role="cell">
                {row.year}
              </td>
            </tr>
          ))}
        </tbody>

        <tbody role="rowgroup">
          <tr className="lineup__part" role="row">
            <td role="cell" colSpan={4}>
              <h2 id="toolbox-title" data-rise="">
                {LIST.toolbox}
              </h2>
            </td>
          </tr>
          <tr className="sr-only" role="row">
            {LIST.columns.toolbox.map((name, i) => (
              <th key={name} role="columnheader" scope="col" colSpan={i === 2 ? 2 : undefined}>
                {name}
              </th>
            ))}
          </tr>
          {TOOLBOX.map((row, i) => (
            <tr key={row.tool} className="lineup__row" role="row" data-rise="" data-rise-i={step(i)}>
              <th className="lineup__name" role="rowheader" scope="row">
                <span className="lineup__label">{row.tool}</span>
              </th>
              <td className="lineup__what" role="cell">
                {row.usedFor}
              </td>
              <td className="lineup__with lineup__with--wide" role="cell" colSpan={2}>
                {row.where}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

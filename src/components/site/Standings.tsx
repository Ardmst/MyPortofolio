/**
 * The current top five of a public KicauScore scoreboard, read on the server.
 *
 * Optional second proof for the KicauScore block (DESIGN.md §1, "The live
 * thing"). It is a GET of that site's own public JSON, cached and re-read at
 * most every ten minutes (so the page stays static), with a three-second
 * limit. On any failure, or any answer that is not shaped as expected, it
 * renders nothing at all.
 *
 * The names and scores on that site are seeded demo data; the caption says so.
 */

interface Entry {
  rank: number;
  slot: string;
  bird: string;
  owner: string;
  score: string;
}

interface Board {
  category: string;
  entries: Entry[];
}

const REVALIDATE_SECONDS = 600;
const TIMEOUT_MS = 3000;
const ROWS = 5;

const text = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim() && value.length <= max ? value.trim() : null;

async function readBoard(api: string): Promise<Board | null> {
  try {
    const response = await fetch(api, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return null;
    const { status, kategori_nama, leaderboard } = data as Record<string, unknown>;
    const category = text(kategori_nama, 60);
    if (status !== "success" || !category || !Array.isArray(leaderboard)) return null;

    const entries: Entry[] = [];
    for (const row of leaderboard.slice(0, ROWS)) {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const rank = typeof item.peringkat === "number" ? item.peringkat : Number.NaN;
      const slot = text(item.nomor_gantangan, 12);
      const bird = text(item.nama_burung, 40);
      const owner = text(item.pemilik, 40);
      const score = text(item.total_skor_akhir, 10);
      if (!Number.isInteger(rank) || !slot || !bird || !owner || !score || !/^\d{1,3}(\.\d{1,2})?$/.test(score)) {
        return null;
      }
      entries.push({ rank, slot, bird, owner, score });
    }
    return entries.length === ROWS ? { category, entries } : null;
  } catch {
    return null;
  }
}

export async function Standings({ api, caption }: { api: string; caption: string }) {
  const board = await readBoard(api);
  if (!board) return null;

  return (
    // data-ui: a real interface fragment; it keeps a table's own conventions.
    <figure className="standings" data-ui="" data-rise="">
      <table>
        <caption>{board.category}</caption>
        <thead>
          <tr>
            <th scope="col">Place</th>
            <th scope="col">Bird</th>
            <th scope="col">Slot</th>
            <th scope="col" className="standings__num">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {board.entries.map((entry) => (
            <tr key={`${entry.rank}-${entry.slot}`}>
              <td>{entry.rank}</td>
              <td>
                {entry.bird}
                <span className="standings__owner">{entry.owner}</span>
              </td>
              <td>{entry.slot}</td>
              <td className="standings__num">{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

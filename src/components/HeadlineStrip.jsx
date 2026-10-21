// Four headline changes from the headline start year to the headline end
// year, each linking to the section that charts it (lib/headline.js).

import { fyDash } from "../lib/outlook";
import { headlineTiles } from "../lib/headline";

export default function HeadlineStrip({ data }) {
  const tiles = headlineTiles(data);
  if (!tiles.length) return null;
  const [from, to] = tiles[0].years;
  return (
    <section className="headline" aria-labelledby="headline-title">
      <h2 id="headline-title" className="headline-title">
        Headline changes, {fyDash(from)} to {fyDash(to)}
      </h2>
      <ul className="headline-strip">
        {tiles.map((t) => (
          <li key={t.id}>
            <a className="headline-tile" href={t.href}>
              <span className="headline-label">{t.label}</span>
              <span className="headline-values">
                <span className="headline-from">{t.from}</span>
                <span className="headline-arrow" aria-label="to">
                  →
                </span>
                <span className="headline-to">{t.to}</span>
              </span>
              <span className="headline-change">{t.change}</span>
              <span className="headline-qualifier">{t.qualifier}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

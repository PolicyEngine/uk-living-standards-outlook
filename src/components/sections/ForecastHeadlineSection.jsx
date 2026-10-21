// Headline forecast figures, in the same strip style as the Baseline tab's headline.

import { HERO_YEAR, changeClass, pctLabel, ppLabel, toRows } from "../../lib/forecast";
import { ObrSource } from "../../lib/sources";

// ONS series pages for the tile names (checked 20 Oct 2026). Earnings is not
// linked: the tile is OBR's calendar-year average earnings growth, and ONS
// KAB9 is a level series, not that growth rate; the tile's source is the OBR.
const ONS_SERIES = {
  cpi: "https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23",
  rpi: "https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/czbh/mm23",
};

export default function ForecastHeadlineSection({ data }) {
  const forecast = data.forecast;
  const published = Boolean(forecast.post_published);
  const byKey = {};
  forecast.sections.forEach((s) => s.series.forEach((series) => (byKey[series.key] = series)));

  const cards = (forecast.headline || [])
    .map((key) => {
      const series = byKey[key];
      if (!series) return null;
      const row = toRows(series, published).find((r) => r.year === HERO_YEAR);
      if (!row) return null;
      return { key, label: `${series.label.replace(/ (inflation|growth)$/i, "")} ${HERO_YEAR}`, ...row };
    })
    .filter(Boolean);

  if (!cards.length) return null;

  return (
    <ul className="headline-strip three-up">
      {cards.map((card) => (
        <li key={card.key} className="headline-tile static">
          <span className="headline-label">
            {ONS_SERIES[card.key] ? (
              <a href={ONS_SERIES[card.key]} target="_blank" rel="noopener noreferrer" title="ONS series">
                {card.label}
              </a>
            ) : (
              card.label
            )}
          </span>
          {published ? (
            <>
              <span className="headline-values">
                <span className="headline-from">{pctLabel(card.previous)}</span>
                <span className="headline-arrow" aria-label="to">
                  →
                </span>
                <span className="headline-to">{pctLabel(card.updated)}</span>
              </span>
              <span className={`headline-change ${changeClass(card.change)}`}>{ppLabel(card.change)}</span>
            </>
          ) : (
            <>
              <span className="headline-values">
                <span className="headline-to">{pctLabel(card.previous)}</span>
              </span>
              <span className="headline-change">Budget revision pending</span>
            </>
          )}
          <span className="headline-qualifier">
            <ObrSource />
          </span>
        </li>
      ))}
    </ul>
  );
}

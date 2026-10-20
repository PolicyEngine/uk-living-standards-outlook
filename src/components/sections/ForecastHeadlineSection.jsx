// Headline forecast figures as AB26 .key-metric tiles.

import { HERO_YEAR, changeClass, pctLabel, ppLabel, toRows } from "../../lib/forecast";

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
    <div className="key-metrics-row three-up">
      {cards.map((card) => (
        <div key={card.key} className="key-metric">
          <div className="metric-label">{card.label}</div>
          {published ? (
            <>
              <div className="metric-number">
                {pctLabel(card.previous)} &rarr; {pctLabel(card.updated)}
              </div>
              <div className={`metric-sub ${changeClass(card.change)}`}>{ppLabel(card.change)}</div>
            </>
          ) : (
            <>
              <div className="metric-number">{pctLabel(card.previous)}</div>
              <div className="metric-sub">Budget revision pending</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// Says visibly whether the Budget forecast has been published (DATA_CONTRACT.md).

import { lowerFirst } from "../../lib/forecast";

export default function ForecastStatusSection({ data }) {
  const forecast = data.forecast;
  if (forecast.post_published) return null;
  return (
    <div className="page-notice" role="status">
      <strong>Budget forecast not yet published.</strong> This tab shows the {forecast.pre_label} forecast
      only. Each chart will compare it with the {lowerFirst(forecast.post_label)} once the OBR publishes it
      alongside the Autumn Budget.
    </div>
  );
}

import { splitSource } from "../lib/outlook";

export default function Footer({ meta }) {
  if (!meta) return null;
  const source = splitSource(meta.outturn_source);
  const ds = meta.dataset || {};
  const generated = meta.generated_at ? new Date(meta.generated_at) : null;

  return (
    <footer className="app-footer">
      <dl>
        <dt>Engine</dt>
        <dd>
          policyengine {meta.policyengine} (policyengine-uk {meta.policyengine_uk})
        </dd>
        <dt>Dataset</dt>
        <dd>
          {ds.name}
          {ds.tag ? ` @ ${ds.tag}` : ""}
          {ds.sha256 && ds.sha256 !== ds.tag ? (
            <>
              {" "}
              (sha256 <code>{String(ds.sha256).slice(0, 12)}</code>)
            </>
          ) : null}
        </dd>
        {meta.deflator && (
          <>
            <dt>Real terms</dt>
            <dd>
              {meta.real_price_base} prices; {meta.deflator}
            </dd>
          </>
        )}
        <dt>Outturn source</dt>
        <dd>
          {source.url ? (
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.label}
            </a>
          ) : (
            source.label
          )}
        </dd>
        {generated && !Number.isNaN(generated.getTime()) && (
          <>
            <dt>Generated</dt>
            <dd>
              {generated.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/London" })}
            </dd>
          </>
        )}
      </dl>
      <ul>
        {!(meta.notes || []).some((n) => /unvalidated/i.test(n)) && (
          <li>Projections are unvalidated under this engine version.</li>
        )}
        {(meta.notes || []).map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </footer>
  );
}

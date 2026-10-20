import "./OutcomeToggle.css";

/**
 * Segmented button group. Markup and CSS are AB26's OutcomeToggle; options
 * may be disabled (with a title explaining why), which OutcomeToggle lacks.
 *
 * options: [{ id, label, disabled?, title? }]
 */
export default function SegmentedToggle({ options, value, onChange, label }) {
  return (
    <div className="outcome-toggle" role="group" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`outcome-toggle-button${value === opt.id ? " active" : ""}`}
          aria-pressed={value === opt.id}
          disabled={opt.disabled}
          title={opt.title}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

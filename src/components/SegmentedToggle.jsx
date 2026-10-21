import "./OutcomeToggle.css";

/**
 * Segmented button group. Markup and CSS are AB26's OutcomeToggle; options
 * may be disabled (with a title explaining why), which OutcomeToggle lacks.
 *
 * options: [{ id, label, disabled?, title? }]. With fieldLabel, a small
 * label sits before the group, as Dropdown's.
 */
export default function SegmentedToggle({ options, value, onChange, label, fieldLabel }) {
  const group = (
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
  if (!fieldLabel) return group;
  return (
    <div className="control-field">
      <span className="control-label">{fieldLabel}</span>
      {group}
    </div>
  );
}

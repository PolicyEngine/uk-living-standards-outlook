import { useEffect, useRef, useState } from "react";
import "./YearSelector.css";

/**
 * Single-choice dropdown. Markup and CSS are AB26's YearSelector, generalised
 * from years to any { id, label } options.
 */
export default function Dropdown({ options, value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const current = options.find((o) => o.id === value);

  return (
    <div className="year-selector" ref={ref}>
      <button
        type="button"
        className="year-selector-button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}: ${current?.label ?? ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="year-label">{current?.label ?? label}</span>
        <svg
          className={`dropdown-arrow ${isOpen ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2 4 6 8 10 4"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="year-dropdown" role="listbox" aria-label={label}>
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="option"
              aria-selected={opt.id === value}
              className={`year-option ${opt.id === value ? "selected" : ""}`}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

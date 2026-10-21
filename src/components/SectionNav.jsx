"use client";

// In-page section links. Desktop: a sticky row of links that marks the
// section in view. Phone: the same links collapse into one "Jump to" select.

import { useEffect, useState } from "react";

export default function SectionNav({ items }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((it) => document.getElementById(it.id)).filter(Boolean);
    if (!els.length) return undefined;
    const onScroll = () => {
      // The last section whose top has passed just under the sticky bar.
      let current = els[0].id;
      els.forEach((el) => {
        if (el.getBoundingClientRect().top <= 96) current = el.id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (items.length < 2) return null;

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="section-nav" aria-label="Sections on this page">
      <div className="section-nav-inner">
        <ul className="section-nav-links">
          {items.map((it) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className={active === it.id ? "active" : ""}
                aria-current={active === it.id ? "true" : undefined}
              >
                {it.label}
              </a>
            </li>
          ))}
        </ul>
        <label className="section-nav-select">
          <span>Jump to</span>
          <select value={active} onChange={(e) => go(e.target.value)}>
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </nav>
  );
}

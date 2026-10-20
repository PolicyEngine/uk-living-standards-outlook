import { useEffect, useRef, useState } from "react";

/**
 * Measure an element's width. Used instead of Recharts' ResponsiveContainer,
 * which intermittently measured a near-zero size in the static export and drew
 * a tiny chart.
 */
export default function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setWidth(Math.floor(el.getBoundingClientRect().width));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

import { useEffect, useState } from "react";

export interface LiveTickerItem {
  prefix: string;
  value: string;
}

interface Props {
  items: LiveTickerItem[];
  intervalMs?: number;
}

/**
 * Tiny status pill for the global header. Rotates through "currently
 * working in / now scheduling / available" snippets. Pure CSS fade,
 * no GSAP. Pauses when document is hidden or on hover. Honors
 * prefers-reduced-motion (no fade — instant swap).
 */
export default function LiveTicker({ items, intervalMs = 8000 }: Props) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (paused) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIdx((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, intervalMs, paused]);

  if (!items.length) return null;
  const cur = items[idx] ?? items[0]!;

  return (
    <div
      className="hidden xl:inline-flex items-center gap-2.5 rounded-full bg-white/[0.03] border border-[color-mix(in_srgb,var(--fg)_10%,transparent)] px-3 py-1.5 text-[0.65rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="relative inline-block h-1.5 w-1.5" aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-accent)]/60" />
        <span className="relative block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
      </span>
      <span className="font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
        <span className="sr-only">{cur.prefix}: </span>
        <span aria-hidden="true">{cur.prefix}</span>
      </span>
      <span
        aria-live="polite"
        aria-atomic="true"
        className="font-medium tracking-tight text-[var(--fg)]/85 transition-opacity duration-300"
        key={idx}
      >
        {cur.value}
      </span>
    </div>
  );
}

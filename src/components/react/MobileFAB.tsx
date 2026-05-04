import { useEffect, useRef, useState } from "react";

interface Props {
  href: string;
  label: string;
}

/**
 * Sticky mobile-only "Get a quote" floating action button. Hides while
 * scrolling rapidly down (so it doesn't fight the user) and reappears on
 * scroll-up or scroll-stop. Pulses softly when idle.
 */
export default function MobileFAB({ href, label }: Props) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const lastT = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const now = performance.now();
        const dy = y - lastY.current;
        const dt = now - lastT.current || 1;
        const v = (dy / dt) * 1000; // px/s
        if (v > 1200) setHidden(true);
        else if (v < 0 || Math.abs(v) < 80) setHidden(false);
        lastY.current = y;
        lastT.current = now;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <a
      href={href}
      data-cursor-hover
      aria-label={label}
      className={`md:hidden fixed end-4 bottom-24 z-40 flex h-14 items-center gap-2 rounded-full bg-[var(--color-accent)] ps-5 pe-4 text-sm font-medium text-black shadow-[0_18px_50px_-12px_var(--color-accent)] transition-all duration-300 ${
        hidden ? "translate-y-24 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <span className="relative">
        <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" aria-hidden="true" />
        <span className="relative block h-2 w-2 rounded-full bg-white" />
      </span>
      {label}
      <svg width="14" height="14" viewBox="0 0 18 18" fill="none" className="rtl:rotate-180" aria-hidden="true">
        <path d="M3 9h12M11 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

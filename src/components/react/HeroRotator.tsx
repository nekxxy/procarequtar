import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap } from "../../lib/gsap";

interface Props {
  words: string[];
  intervalMs?: number;
  className?: string;
}

/**
 * Cycles through a list of words with a vertical mask reveal.
 * Pauses on tab visibility hidden.
 */
export default function HeroRotator({
  words,
  intervalMs = 2400,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [, setIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!words.length) return;
    registerGsap();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    const el = ref.current;
    if (!el) return;

    let i = 0;
    el.textContent = words[0] ?? "";

    if (reduced) return;

    const tick = () => {
      i = (i + 1) % words.length;
      const next = words[i] ?? "";
      gsap.to(el, {
        yPercent: -110,
        opacity: 0,
        duration: 0.55,
        ease: "expo.in",
        onComplete: () => {
          el.textContent = next;
          gsap.fromTo(
            el,
            { yPercent: 110, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.7,
              ease: "expo.out",
            },
          );
          setIndex(i);
        },
      });
    };
    const id = window.setInterval(tick, intervalMs);

    const onVisibility = () => {
      if (document.hidden) {
        window.clearInterval(id);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [words, intervalMs]);

  return (
    <span className={`inline-block overflow-hidden align-bottom ${className ?? ""}`}>
      <span
        ref={ref}
        className="inline-block will-change-transform text-[var(--color-accent)]"
        aria-live="polite"
      />
    </span>
  );
}

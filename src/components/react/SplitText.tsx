import { useRef, type ReactNode } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import { duration, stagger as st } from "../../lib/motion";

interface Props {
  className?: string;
  /** Starting state — defaults to entering from below. */
  from?: { y?: number; rotate?: number; opacity?: number };
  /** Stagger between characters/words in seconds. */
  stagger?: number;
  /** Animation duration. */
  durationSec?: number;
  /** Trigger on scroll into view (default true) or run on mount. */
  onScroll?: boolean;
  /** Delay in seconds before timeline starts. */
  delay?: number;
  /** Split by "chars" (default) or "words". */
  split?: "chars" | "words";
  children: ReactNode;
}

export default function SplitText({
  className,
  from = { y: 60, opacity: 0 },
  stagger = st.tight,
  durationSec = duration.lg,
  onScroll = true,
  delay = 0,
  split = "chars",
  children,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGsap(ref, () => {
    const root = ref.current;
    if (!root) return;

    // Build atomic spans from the rendered text content
    const text = root.textContent ?? "";
    root.textContent = "";

    const segments =
      split === "words" ? text.split(/(\s+)/) : Array.from(text);

    const spans: HTMLSpanElement[] = [];
    for (const seg of segments) {
      if (seg === "") continue;
      if (/^\s+$/.test(seg)) {
        root.appendChild(document.createTextNode(seg));
        continue;
      }
      const span = document.createElement("span");
      span.style.display = "inline-block";
      span.style.willChange = "transform, opacity";
      span.textContent = seg;
      root.appendChild(span);
      spans.push(span);
    }

    gsap.set(spans, { ...from });

    const tween = gsap.to(spans, {
      y: 0,
      x: 0,
      rotate: 0,
      opacity: 1,
      duration: durationSec,
      ease: "expo.out",
      stagger,
      delay,
      paused: onScroll,
    });

    if (onScroll) {
      ScrollTrigger.create({
        trigger: root,
        start: "top 85%",
        once: true,
        onEnter: () => tween.play(),
      });
    }
  }, []);

  return (
    <span
      ref={ref}
      className={className}
      aria-label={typeof children === "string" ? children : undefined}
    >
      {children}
    </span>
  );
}

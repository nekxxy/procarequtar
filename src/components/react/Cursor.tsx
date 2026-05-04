import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap } from "../../lib/gsap";

/**
 * Custom blend-mode cursor. Hidden on touch devices and reduced-motion.
 * Grows on hover of [data-cursor-hover] elements (links, buttons).
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (isTouch || reduced) return;
    setEnabled(true);
    registerGsap();

    if (!dot.current || !ring.current) return;
    const setDX = gsap.quickTo(dot.current, "x", { duration: 0.18, ease: "expo.out" });
    const setDY = gsap.quickTo(dot.current, "y", { duration: 0.18, ease: "expo.out" });
    const setRX = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "expo.out" });
    const setRY = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "expo.out" });

    const onMove = (e: PointerEvent) => {
      setDX(e.clientX);
      setDY(e.clientY);
      setRX(e.clientX);
      setRY(e.clientY);
    };

    const grow = () => {
      gsap.to(ring.current, { scale: 2.4, duration: 0.4, ease: "expo.out" });
    };
    const shrink = () => {
      gsap.to(ring.current, { scale: 1, duration: 0.4, ease: "expo.out" });
    };

    const enterables = "a, button, [data-cursor-hover], input, textarea, select";
    const onEnter = (e: Event) => {
      if ((e.target as HTMLElement).closest(enterables)) grow();
    };
    const onLeave = (e: Event) => {
      if ((e.target as HTMLElement).closest(enterables)) shrink();
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onEnter, true);
    document.addEventListener("pointerout", onLeave, true);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onEnter, true);
      document.removeEventListener("pointerout", onLeave, true);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div data-cursor aria-hidden="true">
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--fg)] mix-blend-difference"
        style={{ willChange: "transform" }}
      />
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--fg)] mix-blend-difference"
        style={{ willChange: "transform" }}
      />
    </div>
  );
}

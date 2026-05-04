import { useEffect, type RefObject } from "react";
import { gsap, registerGsap } from "../lib/gsap";

interface Options {
  max?: number;
  scale?: number;
  speed?: number;
}

/**
 * Applies the same 3D-tilt effect to every element inside `scopeRef`
 * matching the selector. One useEffect, many cards. Skips touch + reduced.
 */
export function useTiltAll(
  scopeRef: RefObject<HTMLElement | null>,
  selector: string,
  options: Options = {},
): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!scopeRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || isTouch) return;

    registerGsap();

    const max = options.max ?? 8;
    const scale = options.scale ?? 1.02;
    const speed = options.speed ?? 0.45;

    const cards = Array.from(
      scopeRef.current.querySelectorAll<HTMLElement>(selector),
    );

    const cleanups: Array<() => void> = [];
    cards.forEach((el) => {
      el.style.transformStyle = "preserve-3d";
      el.style.perspective = "1000px";
      el.style.willChange = "transform";

      const setRX = gsap.quickTo(el, "rotateX", { duration: speed, ease: "expo.out" });
      const setRY = gsap.quickTo(el, "rotateY", { duration: speed, ease: "expo.out" });
      const setS = gsap.quickTo(el, "scale", { duration: speed, ease: "expo.out" });

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        setRX(-dy * max);
        setRY(dx * max);
        setS(scale);
      };
      const onLeave = () => {
        setRX(0);
        setRY(0);
        setS(1);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [scopeRef, selector, options.max, options.scale, options.speed]);
}

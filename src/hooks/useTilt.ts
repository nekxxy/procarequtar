import { useEffect, type RefObject } from "react";
import { gsap, registerGsap } from "../lib/gsap";

interface Options {
  max?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
}

/**
 * Adds a 3D perspective tilt to the referenced element on pointer
 * movement. Disabled on touch devices and reduced-motion. Uses GSAP
 * quickTo for smooth interpolation.
 */
export function useTilt(
  ref: RefObject<HTMLElement | null>,
  options: Options = {},
): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!ref.current) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || isTouch) return;

    registerGsap();

    const max = options.max ?? 8;
    const perspective = options.perspective ?? 1000;
    const scale = options.scale ?? 1.02;
    const speed = options.speed ?? 0.45;

    const el = ref.current;
    el.style.transformStyle = "preserve-3d";
    el.style.perspective = `${perspective}px`;

    const setRX = gsap.quickTo(el, "rotateX", { duration: speed, ease: "expo.out" });
    const setRY = gsap.quickTo(el, "rotateY", { duration: speed, ease: "expo.out" });
    const setS = gsap.quickTo(el, "scale", { duration: speed, ease: "expo.out" });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
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
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, options.max, options.perspective, options.scale, options.speed]);
}

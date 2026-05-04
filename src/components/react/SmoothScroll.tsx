import { useEffect } from "react";
import Lenis from "lenis";
import { registerGsap, gsap, ScrollTrigger } from "../../lib/gsap";

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Mounts a single global Lenis instance and bridges it to GSAP's ScrollTrigger.
 * Disabled when prefers-reduced-motion is set.
 */
export default function SmoothScroll(): null {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    registerGsap();

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    lenisInstance = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Re-init on Astro view-transition page swaps
    const handleSwap = () => {
      lenis.scrollTo(0, { immediate: true });
      ScrollTrigger.refresh();
    };
    document.addEventListener("astro:after-swap", handleSwap);

    return () => {
      document.removeEventListener("astro:after-swap", handleSwap);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}

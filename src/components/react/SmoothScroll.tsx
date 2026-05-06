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
      // Tighter follow than the default 0.1 — feels more responsive on desktop
      lerp: 0.08,
      smoothWheel: true,
      // Damp wheel so trackpad / scroll-wheel doesn't overshoot the scrub
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
      // Use easeOutExpo so deceleration feels cinematic, not robotic
      easing: (x: number) => 1 - Math.pow(1 - x, 5),
      syncTouch: true,
    });
    lenisInstance = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Pause Lenis RAF when tab is hidden — saves battery on mobile and avoids
    // queued scroll work that would all fire when the tab returns.
    const onVisibility = () => {
      if (document.hidden) lenis.stop();
      else lenis.start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Re-init on Astro view-transition page swaps
    const handleSwap = () => {
      lenis.scrollTo(0, { immediate: true });
      ScrollTrigger.refresh();
    };
    document.addEventListener("astro:after-swap", handleSwap);

    return () => {
      document.removeEventListener("astro:after-swap", handleSwap);
      document.removeEventListener("visibilitychange", onVisibility);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}

import { useEffect, type RefObject } from "react";
import { registerGsap, gsap } from "../lib/gsap";

type Setup = (ctx: gsap.Context) => void | (() => void);

/**
 * Scoped gsap.context for a React component. Auto-cleans on unmount and on
 * Astro view-transition swap. All animations created inside `setup()` are
 * automatically reverted by the context.
 */
export function useGsap<T extends Element>(
  scopeRef: RefObject<T | null>,
  setup: Setup,
  deps: ReadonlyArray<unknown> = [],
): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!scopeRef.current) return;
    registerGsap();

    let userCleanup: void | (() => void);
    const ctx = gsap.context(() => {
      userCleanup = setup(ctx);
    }, scopeRef.current);

    const onSwap = () => ctx.revert();
    document.addEventListener("astro:before-swap", onSwap);

    return () => {
      document.removeEventListener("astro:before-swap", onSwap);
      if (typeof userCleanup === "function") userCleanup();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { gsap, registerGsap } from "../../lib/gsap";
import { cn } from "../../lib/cn";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  children: ReactNode;
  /** Maximum pixels of magnetic offset. */
  strength?: number;
  /** Colour variant. */
  variant?: "solid" | "outline" | "ghost";
}

export default function MagneticButton({
  href,
  children,
  strength = 18,
  variant = "solid",
  className,
  ...rest
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || isTouch) return;
    if (!wrap.current || !inner.current) return;
    registerGsap();

    const w = wrap.current;
    const i = inner.current;
    const setX = gsap.quickTo(w, "x", { duration: 0.4, ease: "expo.out" });
    const setY = gsap.quickTo(w, "y", { duration: 0.4, ease: "expo.out" });
    const setIX = gsap.quickTo(i, "x", { duration: 0.55, ease: "expo.out" });
    const setIY = gsap.quickTo(i, "y", { duration: 0.55, ease: "expo.out" });

    const onMove = (e: PointerEvent) => {
      const rect = w.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const factor = strength / Math.max(rect.width, rect.height);
      const tx = dx * factor;
      const ty = dy * factor;
      setX(tx);
      setY(ty);
      setIX(tx * 0.5);
      setIY(ty * 0.5);
    };
    const onLeave = () => {
      setX(0);
      setY(0);
      setIX(0);
      setIY(0);
    };

    w.addEventListener("pointermove", onMove);
    w.addEventListener("pointerleave", onLeave);
    return () => {
      w.removeEventListener("pointermove", onMove);
      w.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  const base =
    "inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-medium tracking-wide rounded-full transition-colors will-change-transform select-none";
  const variants: Record<NonNullable<Props["variant"]>, string> = {
    solid:
      "bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-2)] hover:text-black",
    outline:
      "border border-[color-mix(in_srgb,var(--fg)_24%,transparent)] text-[var(--fg)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
    ghost:
      "text-[var(--fg)] hover:text-[var(--color-accent)]",
  };

  const Inner = (
    <span ref={inner} className="pointer-events-none inline-flex items-center gap-2">
      {children}
    </span>
  );

  if (href) {
    return (
      <div ref={wrap} className="inline-block">
        <a className={cn(base, variants[variant], className)} href={href}>
          {Inner}
        </a>
      </div>
    );
  }
  return (
    <div ref={wrap} className="inline-block">
      <button className={cn(base, variants[variant], className)} {...rest}>
        {Inner}
      </button>
    </div>
  );
}

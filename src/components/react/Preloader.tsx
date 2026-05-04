import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap } from "../../lib/gsap";
import { t, type Locale } from "../../i18n/utils";

interface Props {
  lang: Locale;
}

/**
 * First-paint mask reveal. Runs once per session (sessionStorage gated),
 * skipped on reduced-motion and after first navigation.
 */
export default function Preloader({ lang }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduced) return;
    if (sessionStorage.getItem("pc:preloaded") === "1") return;
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    if (!wrap.current || !counter.current || !bar.current) return;
    registerGsap();

    document.documentElement.classList.add("lenis-stopped");
    const lock = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove("lenis-stopped");
        sessionStorage.setItem("pc:preloaded", "1");
        setShow(false);
      },
    });

    tl.to(lock, {
      value: 100,
      duration: 1.6,
      ease: "expo.out",
      onUpdate: () => {
        if (counter.current)
          counter.current.textContent = `${Math.round(lock.value)
            .toString()
            .padStart(3, "0")}`;
      },
    });
    tl.to(
      bar.current,
      { scaleX: 1, duration: 1.6, ease: "expo.out" },
      "<",
    );
    tl.to(
      wrap.current,
      {
        yPercent: -100,
        duration: 1.0,
        ease: "expo.inOut",
      },
      "+=0.15",
    );

    return () => {
      tl.kill();
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [show]);

  if (!show) return null;
  return (
    <div
      ref={wrap}
      data-preloader
      className="fixed inset-0 z-[10000] grid place-items-center bg-[var(--color-bg-dark)] text-[var(--color-fg-dark)]"
      aria-hidden="true"
    >
      <div className="flex w-[min(80vw,560px)] flex-col items-center gap-6 px-6 text-center">
        <div className="font-mono text-xs uppercase tracking-[0.3em] opacity-70">
          {t(lang, "meta.company")}
        </div>
        <div className="display text-[clamp(2.5rem,8vw,6rem)] leading-none tracking-tight">
          <span ref={counter}>000</span>
          <span aria-hidden="true">/100</span>
        </div>
        <div className="h-px w-full overflow-hidden bg-white/10">
          <div
            ref={bar}
            className="h-full origin-left scale-x-0 bg-[var(--color-accent)]"
          />
        </div>
      </div>
    </div>
  );
}

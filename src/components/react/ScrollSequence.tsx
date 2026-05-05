import { useEffect, useRef, useState } from "react";
import { registerGsap, gsap, ScrollTrigger } from "../../lib/gsap";

export interface SequenceOverlay {
  /** Scroll progress 0..1 where this overlay peaks */
  at: number;
  title: string;
  eyebrow?: string;
}

interface Props {
  /** "/procarequtar/sequence" — honour BASE_URL prefix */
  basePath: string;
  /** 240 */
  frameCount: number;
  /** Width breakpoint at which mobile frames are used */
  mobileMaxWidth?: number;
  overlays: SequenceOverlay[];
  loaderLabel: string;
  skipLabel: string;
  /** Anchor (#id or full path) for the "Skip intro" button */
  skipHref: string;
}

/** Smoothstep easing — produces a 0→1 ramp between two thresholds. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Apple-style scroll-scrubbed image sequence. Pure canvas + GSAP
 * ScrollTrigger. Honours prefers-reduced-motion (single static frame),
 * mobile (smaller WebPs), GitHub Pages base path.
 */
export default function ScrollSequence({
  basePath,
  frameCount,
  mobileMaxWidth = 768,
  overlays,
  loaderLabel,
  skipLabel,
  skipHref,
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRefs = useRef<Array<HTMLDivElement | null>>([]);
  const imgsRef = useRef<HTMLImageElement[]>([]);
  const currentFrame = useRef(1);
  const targetFrame = useRef(1);
  const rafQueued = useRef(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  // ---- Frame preload --------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isReducedData =
      typeof (navigator as { connection?: { saveData?: boolean } }).connection
        ?.saveData === "boolean"
        ? Boolean(
            (navigator as { connection?: { saveData?: boolean } }).connection
              ?.saveData,
          )
        : false;
    setReduced(isReducedMotion);

    const isMobile = window.matchMedia(`(max-width: ${mobileMaxWidth}px)`)
      .matches;
    const variant = isMobile ? "mobile" : "desktop";
    const stride = isReducedData || isReducedMotion ? 4 : 1;

    // Build the URL list (every Nth frame on reduced-data)
    const urls: string[] = [];
    for (let i = 1; i <= frameCount; i += stride) {
      const id = String(i).padStart(3, "0");
      urls.push(`${basePath}/${variant}/frame-${id}.webp`);
    }

    let cancelled = false;
    const imgs: HTMLImageElement[] = [];
    let loaded = 0;

    async function loadBatch(start: number, size: number) {
      const slice = urls.slice(start, start + size);
      await Promise.all(
        slice.map((src, k) => {
          const img = new Image();
          img.decoding = "async";
          img.src = src;
          imgs[start + k] = img;
          return img
            .decode()
            .catch(() => undefined)
            .then(() => {
              loaded += 1;
              if (!cancelled) {
                setProgress(loaded / urls.length);
              }
            });
        }),
      );
    }

    (async () => {
      const batchSize = 24;
      for (let i = 0; i < urls.length; i += batchSize) {
        if (cancelled) return;
        await loadBatch(i, batchSize);
      }
      if (cancelled) return;
      imgsRef.current = imgs;
      // For reduced-data we need to map original frame index → loaded index
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [basePath, frameCount, mobileMaxWidth]);

  // ---- Resize canvas to viewport, with DPR -----------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Force a draw on next frame
      rafQueued.current = false;
      queueDraw();
    };

    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // ---- Scroll-tied frame index -----------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!ready) return;
    if (!sectionRef.current) return;

    registerGsap();
    const section = sectionRef.current;
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;
        setProgress(reduced ? 0 : p); // overlay timing reads this
        const idx = Math.round(p * (imgsRef.current.length - 1));
        targetFrame.current = Math.max(0, Math.min(imgsRef.current.length - 1, idx));
        queueDraw();
      },
    });

    const onSwap = () => trigger.kill();
    document.addEventListener("astro:before-swap", onSwap);

    return () => {
      document.removeEventListener("astro:before-swap", onSwap);
      trigger.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reduced]);

  function queueDraw() {
    if (rafQueued.current) return;
    rafQueued.current = true;
    requestAnimationFrame(draw);
  }

  function draw() {
    rafQueued.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const idx = reduced ? 0 : targetFrame.current;
    const img = imgsRef.current[idx];
    if (!img) return;
    currentFrame.current = idx;

    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    ctx.fillStyle = "#1a1c1e";
    ctx.fillRect(0, 0, cssW, cssH);

    // Object-fit: cover — scale to fill while preserving aspect
    const ar = img.naturalWidth / img.naturalHeight;
    let dw = cssW;
    let dh = dw / ar;
    if (dh < cssH) {
      dh = cssH;
      dw = dh * ar;
    }
    const dx = (cssW - dw) / 2;
    const dy = (cssH - dh) / 2;
    // 1px overscan to defeat sub-pixel seams against the page bg
    ctx.drawImage(img, dx - 1, dy - 1, dw + 2, dh + 2);
  }

  // Once frames are ready, draw the first one immediately
  useEffect(() => {
    if (ready) queueDraw();
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: reduced ? "100vh" : "400vh", background: "#1a1c1e" }}
    >
      {/* Sticky stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#1a1c1e]">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="block h-full w-full"
        />

        {/* Loading overlay */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#1a1c1e] transition-opacity duration-700"
          style={{ opacity: ready ? 0 : 1 }}
          aria-live="polite"
          aria-busy={!ready}
        >
          <div className="flex flex-col items-center gap-4 text-white/70">
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.3em]">
              {loaderLabel}
            </div>
            <div className="h-px w-40 overflow-hidden bg-white/10">
              <div
                className="h-full bg-[#FF5B1F] transition-[width] duration-200"
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              />
            </div>
            <div className="font-mono text-[0.65rem] tabular-nums text-white/50">
              {String(Math.round(progress * 100)).padStart(3, "0")} / 100
            </div>
          </div>
        </div>

        {/* Skip intro */}
        <a
          href={skipHref}
          className="absolute end-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-white/70 backdrop-blur-md transition-colors hover:border-white/40 hover:text-white"
        >
          {skipLabel}
          <span aria-hidden="true" className="rtl:rotate-180">→</span>
        </a>

        {/* Parallax overlay text */}
        {overlays.map((o, i) => {
          const window = 0.06; // fade ramp
          const enterFrom = o.at - window * 2.5;
          const enterTo = o.at - window * 0.5;
          const exitFrom = o.at + window * 0.5;
          const exitTo = o.at + window * 2.5;
          const opacity = reduced
            ? 1
            : smoothstep(enterFrom, enterTo, progress) -
              smoothstep(exitFrom, exitTo, progress);
          const translateY = reduced ? 0 : (1 - opacity) * 24;
          return (
            <div
              key={i}
              ref={(el) => {
                overlayRefs.current[i] = el;
              }}
              className="pointer-events-none absolute inset-x-0 top-1/2 z-10 mx-auto flex max-w-[60rem] -translate-y-1/2 flex-col items-center px-6 text-center"
              style={{
                opacity: Math.max(0, opacity),
                transform: `translate3d(0, calc(-50% + ${translateY}px), 0)`,
                willChange: "opacity, transform",
              }}
            >
              {o.eyebrow && (
                <div className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/55">
                  {o.eyebrow}
                </div>
              )}
              <h2 className="mt-3 max-w-[18ch] text-balance text-[clamp(2rem,7vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white/90">
                {o.title}
              </h2>
            </div>
          );
        })}

        {/* Progress dot rail (right edge) */}
        <div className="absolute end-5 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex">
          {overlays.map((o, i) => {
            const active = Math.abs(progress - o.at) < 0.08;
            return (
              <span
                key={i}
                className={`block h-1.5 rounded-full transition-all duration-500 ${
                  active ? "h-6 w-1 bg-[#FF5B1F]" : "h-1 w-1 bg-white/30"
                }`}
              />
            );
          })}
        </div>

        {/* Frame counter (bottom right, monospace) */}
        <div className="absolute bottom-6 end-6 z-10 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/40">
          <span className="tabular-nums text-white/70">
            {String(Math.round(progress * 240))
              .padStart(3, "0")}
          </span>
          <span className="mx-1">/</span>
          240
        </div>
      </div>
    </section>
  );
}

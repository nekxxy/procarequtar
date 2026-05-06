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
  const [loadProgress, setLoadProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  // Index of the highest frame group that has been loaded so far.
  // Used by `draw()` to pick the nearest available frame for any target idx.
  const loadedMaskRef = useRef<Uint8Array>(new Uint8Array(0));

  // ---- Progressive frame load ----------------------------------------
  //
  // Three phases, each yields control back to the event loop so the page
  // stays interactive throughout:
  //
  //   1. Frame 1 alone — paints the canvas immediately (~25 KB).
  //   2. Keyframes every Nth frame — enables coarse scrub (~400 KB).
  //   3. Gap-fill in interleaved order — smooth scrub fully ready (~5 MB).
  //
  // The canvas's `draw()` always picks the nearest *loaded* frame for the
  // current scroll target, so users can start scrubbing the moment phase 2
  // completes (or even during it).
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const conn = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const isReducedData = Boolean(conn?.saveData);
    const slowNetwork = conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g";
    setReduced(isReducedMotion);

    const isMobile = window.matchMedia(`(max-width: ${mobileMaxWidth}px)`)
      .matches;
    const variant = isMobile ? "mobile" : "desktop";

    // Effective frame stride. Default mobile = every 2nd frame (120 frames).
    // Reduced-data / slow-2g / reduced-motion → every 4th (60 frames).
    const stride =
      isReducedData || slowNetwork || isReducedMotion
        ? 4
        : isMobile
          ? 2
          : 1;

    const total = Math.ceil(frameCount / stride);
    const imgs: HTMLImageElement[] = new Array(total);
    const mask = new Uint8Array(total);
    imgsRef.current = imgs;
    loadedMaskRef.current = mask;

    let cancelled = false;
    let loadedCount = 0;
    const loadOne = (idx: number) => {
      if (idx < 0 || idx >= total || imgs[idx]) return Promise.resolve();
      const frameNum = idx * stride + 1;
      const id = String(frameNum).padStart(3, "0");
      const img = new Image();
      img.decoding = "async";
      img.src = `${basePath}/${variant}/frame-${id}.webp`;
      imgs[idx] = img;
      return img
        .decode()
        .catch(() => undefined)
        .then(() => {
          if (cancelled) return;
          mask[idx] = 1;
          loadedCount += 1;
          setLoadProgress(loadedCount / total);
          // Prompt a redraw so any visible frame upgrades to the new closer one
          queueDraw();
        });
    };

    (async () => {
      // Phase 1: first frame
      await loadOne(0);
      if (cancelled) return;
      // Show the canvas as soon as we have any frame to paint
      setReady(true);

      // Phase 2: keyframes every K frames so scrub becomes usable fast
      const phase2Step = Math.max(1, Math.round(total / 16));
      const phase2: number[] = [];
      for (let i = phase2Step; i < total; i += phase2Step) phase2.push(i);
      // Concurrent keyframe load (8 at a time)
      for (let i = 0; i < phase2.length; i += 8) {
        if (cancelled) return;
        await Promise.all(phase2.slice(i, i + 8).map((idx) => loadOne(idx)));
      }

      // Phase 3: fill the rest in interleaved order so the scrub keeps
      // getting smoother evenly across the timeline (rather than leaving
      // chunks at the end un-loaded).
      const remaining: number[] = [];
      for (let i = 1; i < total; i++) {
        if (!mask[i]) remaining.push(i);
      }
      // Bit-reversed order ≈ even fill across the range
      remaining.sort((a, b) => {
        const distA = Math.min(...phase2.map((p) => Math.abs(a - p)));
        const distB = Math.min(...phase2.map((p) => Math.abs(b - p)));
        return distB - distA;
      });
      const concurrency = isMobile ? 4 : 6;
      const queue = [...remaining];
      const workers = Array.from({ length: concurrency }, async () => {
        while (queue.length > 0 && !cancelled) {
          const next = queue.shift();
          if (next == null) break;
          await loadOne(next);
        }
      });
      await Promise.all(workers);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, frameCount, mobileMaxWidth]);

  // ---- Resize canvas to viewport, with DPR -----------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fit = () => {
      // Cap DPR at 1.75 on mobile and 2 on desktop — saves 15-30% of canvas
      // pixel work without visible quality loss.
      const isMobile = window.matchMedia(`(max-width: ${mobileMaxWidth}px)`)
        .matches;
      const dprCap = isMobile ? 1.75 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rafQueued.current = false;
      queueDraw();
      // ScrollTrigger may need to recompute pin positions on viewport change
      ScrollTrigger.refresh();
    };

    // Debounce — resize fires aggressively during continuous drag-resize
    let resizeRaf = 0;
    let resizeTimer = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeRaf = requestAnimationFrame(fit);
      }, 120);
    };

    fit();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      cancelAnimationFrame(resizeRaf);
      window.clearTimeout(resizeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, mobileMaxWidth]);

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
    const target = reduced ? 0 : targetFrame.current;
    // Fall back to nearest loaded frame if the exact target isn't ready yet
    const mask = loadedMaskRef.current;
    const imgs = imgsRef.current;
    let idx = target;
    if (!mask[idx]) {
      // Search outward for the nearest loaded frame
      let r = 1;
      let found = -1;
      while (r < imgs.length) {
        const lo = target - r;
        const hi = target + r;
        if (lo >= 0 && mask[lo]) { found = lo; break; }
        if (hi < imgs.length && mask[hi]) { found = hi; break; }
        r += 1;
      }
      if (found < 0) return; // nothing loaded yet
      idx = found;
    }
    const img = imgs[idx];
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

        {/* Loading overlay — covers only until frame 1 is ready, then fades.
            A tiny background load indicator (bottom-left) keeps showing
            phase-2 / phase-3 progress without blocking interaction. */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#1a1c1e] transition-opacity duration-500"
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
                style={{ width: `${Math.min(100, loadProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Background-fill indicator — shows once interaction is unlocked */}
        {ready && loadProgress < 0.999 && (
          <div
            className="pointer-events-none absolute bottom-6 start-6 z-10 flex items-center gap-2 font-mono text-[0.55rem] uppercase tracking-[0.25em] text-white/35 transition-opacity duration-500"
            aria-hidden="true"
          >
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-[#FF5B1F]">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#FF5B1F]/60" />
            </span>
            <span>Loading frames · {Math.round(loadProgress * 100)}%</span>
          </div>
        )}

        {/* Skip intro */}
        <a
          href={skipHref}
          className="absolute end-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-white/70 backdrop-blur-md transition-colors hover:border-white/40 hover:text-white"
        >
          {skipLabel}
          <span aria-hidden="true" className="rtl:rotate-180">→</span>
        </a>

        {/* Parallax overlay text — each overlay travels a full viewport
            height as its scroll window plays. Alternating alignment +
            mix-blend-mode keeps it editorial, not stacked. */}
        {overlays.map((o, i) => {
          // Window of scroll progress this overlay owns. Generous size +
          // overlap is fine — they cross-fade naturally.
          const winSize = 0.28;
          const winStart = o.at - winSize * 0.5;
          const local = (progress - winStart) / winSize; // 0..1 within window
          const c = Math.max(0, Math.min(1, local));

          // Vertical travel: enters from below the viewport, exits above
          const TRAVEL_VH = 130; // total vertical journey
          const yVh = reduced ? 0 : (0.5 - c) * TRAVEL_VH; // +65 → -65vh

          // Eased opacity ramp — quick fade in, hold, quick fade out
          const fadeIn = c < 0.18 ? c / 0.18 : 1;
          const fadeOut = c > 0.82 ? (1 - c) / 0.18 : 1;
          const opacity = reduced ? 1 : Math.max(0, Math.min(fadeIn, fadeOut));

          // Subtle horizontal drift for parallax depth
          const xDrift = reduced ? 0 : (c - 0.5) * 12; // +/-6 px

          // Editorial alignment per overlay
          const alignments: Array<"start" | "center" | "end"> = [
            "center",
            "start",
            "center",
            "end",
          ];
          const align = alignments[i % alignments.length] ?? "center";
          const justify =
            align === "start"
              ? "items-start text-start"
              : align === "end"
                ? "items-end text-end"
                : "items-center text-center";

          return (
            <div
              key={i}
              ref={(el) => {
                overlayRefs.current[i] = el;
              }}
              className={`pointer-events-none absolute inset-x-0 top-1/2 z-10 mx-auto flex max-w-[78rem] flex-col px-6 md:px-12 ${justify}`}
              style={{
                opacity,
                transform: `translate3d(${xDrift}px, calc(-50% + ${yVh}vh), 0)`,
                willChange: "opacity, transform",
              }}
            >
              {o.eyebrow && (
                <div className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/55">
                  {o.eyebrow}
                </div>
              )}
              <h2
                className="mt-3 max-w-[20ch] text-balance text-[clamp(2.5rem,9vw,7rem)] font-medium leading-[0.98] tracking-[-0.03em] text-white"
                style={{ mixBlendMode: "difference" }}
              >
                {o.title}
              </h2>
              {/* Thin rule that scales with progress — extra cinematic detail */}
              <span
                aria-hidden="true"
                className="mt-6 block h-px bg-white/30"
                style={{
                  width: `${Math.round(c * 100)}px`,
                  maxWidth: "30vw",
                }}
              />
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
            {String(Math.round(progress * frameCount))
              .padStart(3, "0")}
          </span>
          <span className="mx-1">/</span>
          {frameCount}
        </div>
      </div>
    </section>
  );
}

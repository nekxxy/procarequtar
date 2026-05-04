import { useRef } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap } from "../../lib/gsap";

/**
 * Animated isometric construction tower for the hero.
 *
 * - Floors draw in from bottom to top via stroke-dashoffset
 * - Tower-crane jib rotates continuously
 * - Floating annotation labels fade in on a stagger
 * - Subtle mouse parallax sways the whole scene on desktop
 *
 * Pure SVG, ~3kb gzipped, no extra dependencies.
 */

const FLOORS = 14;
const FLOOR_H = 18;
const W = 110; // half-width of footprint
const D = 44; // half-depth of footprint (isometric)
const CX = 320;
const BASE_Y = 540;

interface FloorPoints {
  topY: number;
  bottomY: number;
}

function points(i: number): FloorPoints {
  const bottomY = BASE_Y - i * FLOOR_H;
  return { bottomY, topY: bottomY - FLOOR_H };
}

export default function IsometricTower() {
  const ref = useRef<SVGSVGElement>(null);

  useGsap(ref, () => {
    const svg = ref.current;
    if (!svg) return;
    const root = svg as unknown as Element;

    // Prep stroke-dasharray on every drawable edge so we can animate it
    const edges = root.querySelectorAll<SVGPathElement | SVGLineElement>(
      "[data-edge]",
    );
    edges.forEach((edge) => {
      const len = (edge as SVGGeometryElement).getTotalLength();
      edge.setAttribute("stroke-dasharray", String(len));
      edge.setAttribute("stroke-dashoffset", String(len));
    });

    // Sequenced reveal: ground → floors → crane → annotations
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to('[data-edge="ground"]', {
      strokeDashoffset: 0,
      duration: 1.0,
      stagger: 0.04,
    });
    tl.to(
      '[data-edge="floor"]',
      { strokeDashoffset: 0, duration: 1.4, stagger: 0.05 },
      "-=0.4",
    );
    tl.to(
      '[data-edge="crane"]',
      { strokeDashoffset: 0, duration: 0.8, stagger: 0.05 },
      "-=0.6",
    );
    tl.from(
      "[data-annotation]",
      { opacity: 0, y: 8, duration: 0.6, stagger: 0.08 },
      "-=0.4",
    );

    // Continuous crane spin
    gsap.to('[data-crane="jib"]', {
      rotate: 360,
      transformOrigin: `${CX}px ${BASE_Y - FLOORS * FLOOR_H - 18}px`,
      duration: 28,
      ease: "none",
      repeat: -1,
    });

    // Subtle mouse parallax on desktop
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (!isCoarse) {
      const setX = gsap.quickTo("[data-scene]", "x", {
        duration: 0.9,
        ease: "expo.out",
      });
      const setY = gsap.quickTo("[data-scene]", "y", {
        duration: 0.9,
        ease: "expo.out",
      });
      const setRot = gsap.quickTo("[data-scene]", "rotate", {
        duration: 0.9,
        ease: "expo.out",
      });
      const onMove = (e: PointerEvent) => {
        const r = svg.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        setX(dx * 18);
        setY(dy * 10);
        setRot(dx * 0.6);
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    }
  }, []);

  // Build floors
  const floors = Array.from({ length: FLOORS }).map((_, i) => {
    const { topY, bottomY } = points(i);
    // Diamond outline (top of the floor)
    const top = `M ${CX} ${topY - D} L ${CX + W} ${topY} L ${CX} ${topY + D} L ${CX - W} ${topY} Z`;
    return (
      <g key={`floor-${i}`} className="floor">
        <path data-edge="floor" d={top} />
        <line
          data-edge="floor"
          x1={CX - W}
          y1={topY}
          x2={CX - W}
          y2={bottomY}
        />
        <line
          data-edge="floor"
          x1={CX + W}
          y1={topY}
          x2={CX + W}
          y2={bottomY}
        />
        <line data-edge="floor" x1={CX} y1={topY + D} x2={CX} y2={bottomY + D} />
      </g>
    );
  });

  const topOfTowerY = BASE_Y - FLOORS * FLOOR_H;
  const craneBaseY = topOfTowerY - D;
  const craneMastTop = craneBaseY - 22;

  return (
    <div className="pointer-events-none relative aspect-[3/4] w-full max-w-[640px]">
      <svg
        ref={ref}
        viewBox="0 0 640 720"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 h-full w-full text-[var(--fg)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="towerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
          <pattern
            id="grid"
            width="32"
            height="18.5"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(0)"
          >
            <path
              d="M 32 0 L 0 0 0 18.5"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Background depth gradient behind the tower */}
        <rect
          x={CX - W - 60}
          y={topOfTowerY - 80}
          width={(W + 60) * 2}
          height={BASE_Y - topOfTowerY + 120}
          fill="url(#towerGrad)"
          opacity="0.6"
        />

        <g data-scene>
          {/* Ground plane: an isometric grid diamond */}
          <g>
            <path
              data-edge="ground"
              d={`M ${CX} ${BASE_Y + D + 60} L ${CX + W + 80} ${BASE_Y} L ${CX} ${BASE_Y - D - 50} L ${CX - W - 80} ${BASE_Y} Z`}
            />
            {/* Grid hatching across the diamond */}
            {Array.from({ length: 6 }).map((_, i) => {
              const t = (i + 1) / 7;
              const yShift = (D + 60) * (t - 0.5) * 2;
              return (
                <line
                  key={`g1-${i}`}
                  data-edge="ground"
                  x1={CX - W - 80 + (W + 80) * t}
                  y1={BASE_Y - (D + 50) * (1 - t)}
                  x2={CX + (W + 80) * t}
                  y2={BASE_Y + (D + 60) - yShift / 2}
                  strokeOpacity="0.25"
                />
              );
            })}
          </g>

          {/* Floors */}
          <g>{floors}</g>

          {/* Tower crane on top */}
          <g data-crane="mast">
            {/* Mast (vertical) */}
            <line
              data-edge="crane"
              x1={CX}
              y1={topOfTowerY - D}
              x2={CX}
              y2={craneMastTop}
            />
            <line
              data-edge="crane"
              x1={CX - 4}
              y1={topOfTowerY - D}
              x2={CX - 4}
              y2={craneMastTop}
            />
            <line
              data-edge="crane"
              x1={CX + 4}
              y1={topOfTowerY - D}
              x2={CX + 4}
              y2={craneMastTop}
            />
            {/* Cross bracing on mast */}
            {Array.from({ length: 4 }).map((_, i) => {
              const y = craneMastTop + i * 6 + 2;
              return (
                <line
                  key={`brace-${i}`}
                  data-edge="crane"
                  x1={CX - 4}
                  y1={y}
                  x2={CX + 4}
                  y2={y - 4}
                  strokeOpacity="0.65"
                />
              );
            })}
          </g>

          {/* Rotating jib (horizontal arm) */}
          <g data-crane="jib" style={{ transformBox: "fill-box" }}>
            <line
              data-edge="crane"
              x1={CX}
              y1={craneMastTop}
              x2={CX + 130}
              y2={craneMastTop - 8}
            />
            <line
              data-edge="crane"
              x1={CX}
              y1={craneMastTop}
              x2={CX - 50}
              y2={craneMastTop - 4}
            />
            {/* Tie-down cables */}
            <line
              data-edge="crane"
              x1={CX}
              y1={craneMastTop - 14}
              x2={CX + 130}
              y2={craneMastTop - 8}
              strokeOpacity="0.55"
            />
            <line
              data-edge="crane"
              x1={CX}
              y1={craneMastTop - 14}
              x2={CX - 50}
              y2={craneMastTop - 4}
              strokeOpacity="0.55"
            />
            {/* Operator cabin */}
            <path
              data-edge="crane"
              d={`M ${CX + 4} ${craneMastTop} L ${CX + 18} ${craneMastTop} L ${CX + 18} ${craneMastTop + 8} L ${CX + 4} ${craneMastTop + 8} Z`}
            />
            {/* Hook line */}
            <line
              data-edge="crane"
              x1={CX + 90}
              y1={craneMastTop - 6}
              x2={CX + 90}
              y2={craneMastTop + 36}
              strokeOpacity="0.7"
            />
            <circle
              cx={CX + 90}
              cy={craneMastTop + 38}
              r={2.5}
              fill="var(--color-accent)"
              stroke="none"
            />
          </g>
        </g>

        {/* Floating annotation lines + dots */}
        <g
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="1"
          fill="none"
        >
          <g data-annotation>
            <line x1={CX + W + 20} y1={BASE_Y - 7 * FLOOR_H} x2={CX + W + 110} y2={BASE_Y - 7 * FLOOR_H} />
            <circle cx={CX + W + 20} cy={BASE_Y - 7 * FLOOR_H} r="2.5" fill="var(--color-accent)" stroke="none" />
          </g>
          <g data-annotation>
            <line x1={CX - W - 20} y1={BASE_Y - 11 * FLOOR_H} x2={CX - W - 100} y2={BASE_Y - 11 * FLOOR_H} />
            <circle cx={CX - W - 20} cy={BASE_Y - 11 * FLOOR_H} r="2.5" fill="currentColor" stroke="none" />
          </g>
          <g data-annotation>
            <line x1={CX + W + 30} y1={craneMastTop} x2={CX + W + 130} y2={craneMastTop - 24} />
            <circle cx={CX + W + 30} cy={craneMastTop} r="2.5" fill="var(--color-accent-2)" stroke="none" />
          </g>
        </g>
      </svg>

      {/* HTML annotations layered over the SVG */}
      <div
        data-annotation
        className="absolute right-[6%] top-[42%] hidden md:block"
      >
        <div className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-[var(--muted)]">
          Floor 24
        </div>
        <div className="display text-base text-[var(--fg)]">+24 levels</div>
      </div>
      <div
        data-annotation
        className="absolute left-[2%] top-[18%] hidden md:block"
      >
        <div className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-[var(--muted)]">
          C.R. 217949
        </div>
        <div className="display text-base text-[var(--fg)]">Doha · Qatar</div>
      </div>
      <div
        data-annotation
        className="absolute right-[2%] top-[6%] hidden md:block"
      >
        <div className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-[var(--muted)]">
          Q2 / 2026
        </div>
        <div className="display text-base text-[var(--fg)]">Active site</div>
      </div>
    </div>
  );
}

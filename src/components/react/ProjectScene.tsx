import { useRef } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap } from "../../lib/gsap";
import type { ServiceSlug } from "../../i18n/utils";

interface Props {
  slug: ServiceSlug;
  className?: string;
  /** Numeric seed used to subtly vary the scene per project */
  seed?: number;
}

/**
 * Procedural isometric "project preview" scenes — one composition per
 * service, varied by a numeric seed so duplicate-service projects don't
 * look identical. Used as the visual fill for project cards in place of
 * real photography.
 *
 * Each scene draws-in on scroll via stroke-dashoffset and gets a unique
 * per-slug idle animation (rotating crane, rising bubbles, pulsing block,
 * ticking gear, sweeping shield).
 */
export default function ProjectScene({ slug, className, seed = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(ref, () => {
    const root = ref.current;
    if (!root) return;

    const draw = root.querySelectorAll<SVGGeometryElement>("[data-draw]");
    draw.forEach((el) => {
      const len = el.getTotalLength();
      el.setAttribute("stroke-dasharray", String(len));
      el.setAttribute("stroke-dashoffset", String(len));
    });

    gsap.to(draw, {
      strokeDashoffset: 0,
      duration: 1.4,
      stagger: 0.025,
      ease: "expo.out",
      scrollTrigger: { trigger: root, start: "top 92%", once: true },
    });

    if (slug === "construction") {
      gsap.to(root.querySelector("[data-jib]"), {
        rotate: 360,
        transformOrigin: "150px 60px",
        duration: 22,
        ease: "none",
        repeat: -1,
      });
    } else if (slug === "post-construction-cleaning") {
      gsap.to(root.querySelectorAll("[data-bubble]"), {
        y: -34,
        opacity: 0,
        duration: 3,
        stagger: 0.5,
        ease: "sine.out",
        repeat: -1,
      });
    } else if (slug === "building-materials") {
      gsap.fromTo(
        root.querySelectorAll("[data-stack]"),
        { y: 8, opacity: 0.7 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.18,
          ease: "expo.out",
          repeat: -1,
          repeatDelay: 1.4,
          yoyo: true,
        },
      );
    } else if (slug === "facility-maintenance") {
      gsap.to(root.querySelector("[data-gear-a]"), {
        rotate: 360,
        transformOrigin: "100px 110px",
        duration: 14,
        ease: "none",
        repeat: -1,
      });
      gsap.to(root.querySelector("[data-gear-b]"), {
        rotate: -360,
        transformOrigin: "180px 80px",
        duration: 11,
        ease: "none",
        repeat: -1,
      });
    } else if (slug === "pest-control") {
      gsap.to(root.querySelector("[data-pulse]"), {
        scale: 1.18,
        opacity: 0.45,
        transformOrigin: "150px 110px",
        duration: 1.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      gsap.to(root.querySelectorAll("[data-spec]"), {
        y: -12,
        opacity: 0,
        duration: 2.2,
        stagger: 0.18,
        ease: "sine.out",
        repeat: -1,
      });
    }
  }, [slug, seed]);

  return (
    <div
      ref={ref}
      className={`relative h-full w-full ${className ?? ""}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 300 220"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={`scene-fade-${slug}-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.25" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
          <pattern
            id={`hatch-${slug}-${seed}`}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(60)"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeOpacity="0.18" />
          </pattern>
        </defs>

        {/* Ambient glow halo */}
        <circle cx={150} cy={170} r={120} fill={`url(#scene-fade-${slug}-${seed})`} />

        {/* Ground line */}
        <line data-draw x1="20" y1="190" x2="280" y2="190" strokeOpacity="0.4" />
        <line data-draw x1="40" y1="200" x2="260" y2="200" strokeOpacity="0.18" />

        {slug === "construction" && (
          <>
            {/* Three towers of varying height (seed-affected) */}
            {[
              { x: 60, h: 70 + (seed % 3) * 12, w: 38 },
              { x: 130, h: 110 + ((seed * 3) % 4) * 10, w: 44 },
              { x: 220, h: 56 + (seed % 2) * 16, w: 36 },
            ].map((t, i) => {
              const baseY = 190;
              const topY = baseY - t.h;
              return (
                <g key={i}>
                  <path data-draw d={`M ${t.x - t.w / 2} ${baseY} V ${topY} H ${t.x + t.w / 2} V ${baseY}`} />
                  {/* Floor lines */}
                  {Array.from({ length: Math.floor(t.h / 14) }).map((_, j) => {
                    const y = baseY - (j + 1) * 14;
                    return (
                      <line
                        key={j}
                        data-draw
                        x1={t.x - t.w / 2 + 4}
                        y1={y}
                        x2={t.x + t.w / 2 - 4}
                        y2={y}
                        strokeOpacity="0.45"
                      />
                    );
                  })}
                  {/* Window slits */}
                  {Array.from({ length: Math.floor(t.h / 14) }).map((_, j) => (
                    <rect
                      key={`w-${j}`}
                      x={t.x - 4}
                      y={baseY - (j + 1) * 14 + 3}
                      width="8"
                      height="6"
                      stroke="currentColor"
                      strokeOpacity="0.3"
                      fill="currentColor"
                      fillOpacity="0.06"
                    />
                  ))}
                </g>
              );
            })}

            {/* Crane mast (mid tower) */}
            <line data-draw x1="150" y1="80" x2="150" y2="56" strokeOpacity="0.7" />
            {/* Jib */}
            <g data-jib>
              <line data-draw x1="150" y1="60" x2="220" y2="56" />
              <line data-draw x1="150" y1="60" x2="115" y2="58" />
              <line data-draw x1="200" y1="58" x2="200" y2="74" strokeOpacity="0.6" />
              <circle cx="200" cy="76" r="2" fill="var(--color-accent)" stroke="none" />
            </g>
          </>
        )}

        {slug === "post-construction-cleaning" && (
          <>
            {/* Building outline being polished */}
            <path data-draw d="M 60 190 V 80 H 200 V 190" />
            {/* Window grid */}
            {Array.from({ length: 5 }).map((_, row) =>
              Array.from({ length: 5 }).map((_, col) => (
                <rect
                  key={`${row}-${col}`}
                  data-draw
                  x={70 + col * 26}
                  y={92 + row * 18}
                  width="18"
                  height="12"
                  strokeOpacity={(row + col + seed) % 3 === 0 ? "1" : "0.35"}
                  fill={(row + col + seed) % 3 === 0 ? "var(--color-accent)" : "none"}
                  fillOpacity="0.18"
                />
              )),
            )}
            {/* Spray bottle on the right */}
            <path data-draw d="M 220 170 H 250 V 200 H 220 Z" />
            <path data-draw d="M 230 170 V 158 H 240 V 170" />
            <path data-draw d="M 240 158 H 268 L 274 152" />
            {/* Sparkles + bubbles */}
            {[
              { x: 264, y: 132, r: 4 },
              { x: 252, y: 144, r: 3 },
              { x: 274, y: 110, r: 2.4 },
            ].map((b, i) => (
              <g key={i} data-bubble>
                <circle cx={b.x} cy={b.y} r={b.r} stroke="var(--color-accent)" strokeOpacity="0.9" />
                <circle cx={b.x - b.r * 0.3} cy={b.y - b.r * 0.3} r={b.r * 0.25} fill="var(--color-accent)" stroke="none" />
              </g>
            ))}
            {/* Squeegee streak */}
            <path data-draw d="M 70 92 L 200 92" stroke="var(--color-accent)" strokeWidth="2" />
          </>
        )}

        {slug === "building-materials" && (
          <>
            {/* Warehouse outline */}
            <path data-draw d="M 30 190 V 90 L 150 60 L 270 90 V 190" strokeOpacity="0.5" />
            {/* Stacked block pallets (3 stacks) */}
            {[60, 130, 200].map((bx, i) => (
              <g key={i} data-stack>
                {Array.from({ length: 4 }).map((_, j) => {
                  const by = 188 - j * 16;
                  return (
                    <g key={j}>
                      <path data-draw d={`M ${bx} ${by} L ${bx + 50} ${by} L ${bx + 60} ${by - 12} L ${bx + 10} ${by - 12} Z`} />
                      <line data-draw x1={bx} y1={by} x2={bx + 10} y2={by - 12} />
                      <line data-draw x1={bx + 50} y1={by} x2={bx + 60} y2={by - 12} />
                      {/* hatch on top face */}
                      <path
                        d={`M ${bx + 10} ${by - 12} L ${bx + 60} ${by - 12} L ${bx + 50} ${by} L ${bx} ${by} Z`}
                        fill={`url(#hatch-${slug}-${seed})`}
                      />
                    </g>
                  );
                })}
              </g>
            ))}
          </>
        )}

        {slug === "facility-maintenance" && (
          <>
            {/* Building cutaway */}
            <path data-draw d="M 60 190 V 70 H 240 V 190 Z" />
            <line data-draw x1="60" y1="110" x2="240" y2="110" strokeOpacity="0.4" />
            <line data-draw x1="60" y1="150" x2="240" y2="150" strokeOpacity="0.4" />
            {/* HVAC ducts hint */}
            <path data-draw d="M 70 130 H 130 V 90 H 180 V 130 H 230" stroke="var(--color-accent)" strokeOpacity="0.7" />
            {/* Big gear A */}
            <g data-gear-a>
              <circle data-draw cx="100" cy="110" r="20" />
              <circle data-draw cx="100" cy="110" r="6" />
              {Array.from({ length: 10 }).map((_, i) => {
                const a = (i * 360) / 10;
                const r = (a * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    data-draw
                    x1={100 + Math.cos(r) * 21}
                    y1={110 + Math.sin(r) * 21}
                    x2={100 + Math.cos(r) * 27}
                    y2={110 + Math.sin(r) * 27}
                  />
                );
              })}
            </g>
            {/* Smaller gear B */}
            <g data-gear-b>
              <circle data-draw cx="180" cy="80" r="14" />
              <circle data-draw cx="180" cy="80" r="4" />
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i * 360) / 8;
                const r = (a * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    data-draw
                    x1={180 + Math.cos(r) * 15}
                    y1={80 + Math.sin(r) * 15}
                    x2={180 + Math.cos(r) * 20}
                    y2={80 + Math.sin(r) * 20}
                  />
                );
              })}
            </g>
            {/* Status diodes */}
            <circle cx="220" cy="170" r="2.5" fill="var(--color-accent)" stroke="none" />
            <circle cx="210" cy="170" r="2.5" fill="var(--color-accent-2)" stroke="none" opacity="0.7" />
          </>
        )}

        {slug === "pest-control" && (
          <>
            {/* Building under shield */}
            <path data-draw d="M 110 190 V 110 H 190 V 190 Z" />
            {Array.from({ length: 3 }).map((_, row) =>
              Array.from({ length: 2 }).map((_, col) => (
                <rect
                  key={`${row}-${col}`}
                  data-draw
                  x={120 + col * 30}
                  y={120 + row * 22}
                  width="20"
                  height="14"
                  strokeOpacity="0.5"
                />
              )),
            )}
            {/* Shield aura */}
            <circle data-pulse cx="150" cy="110" r="80" stroke="var(--color-accent)" strokeOpacity="0.45" strokeDasharray="3 5" />
            {/* Hex shield outline */}
            <path data-draw d="M 150 36 L 220 60 V 110 C 220 150 192 178 150 196 C 108 178 80 150 80 110 V 60 Z" stroke="var(--color-accent)" />
            {/* Specks dispersing */}
            {[
              { x: 60, y: 80 },
              { x: 240, y: 80 },
              { x: 70, y: 150 },
              { x: 230, y: 150 },
            ].map((s, i) => (
              <circle key={i} data-spec cx={s.x} cy={s.y} r="2" fill="currentColor" stroke="none" />
            ))}
          </>
        )}
      </svg>
    </div>
  );
}

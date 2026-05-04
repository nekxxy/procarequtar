import { useRef } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap } from "../../lib/gsap";
import type { ServiceSlug } from "../../i18n/utils";

interface Props {
  slug: ServiceSlug;
  className?: string;
}

/**
 * Animated 64×64 SVG glyphs, one per service. Each one has a unique
 * idle-loop animation that runs on mount and a hover boost via the
 * `[data-service-icon]:hover` rule.
 *
 * Pure SVG, no extra dependencies. Animations run inside `useGsap`
 * so they auto-cleanup on view-transitions.
 */
export default function ServiceIcon({ slug, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(ref, () => {
    const root = ref.current;
    if (!root) return;

    const draw = root.querySelectorAll<SVGGeometryElement>("[data-draw]");
    requestAnimationFrame(() => {
      draw.forEach((el) => {
        const len = el.getTotalLength?.() ?? 0;
        if (len > 0) {
          el.setAttribute("stroke-dasharray", String(len));
          el.setAttribute("stroke-dashoffset", String(len));
        }
      });
      gsap.to(draw, {
        strokeDashoffset: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: "expo.out",
      });
    });

    // Per-slug idle animation
    if (slug === "construction") {
      gsap.to(root.querySelector("[data-jib]"), {
        rotate: 360,
        transformOrigin: "32px 18px",
        duration: 16,
        repeat: -1,
        ease: "none",
      });
    } else if (slug === "post-construction-cleaning") {
      gsap.to(root.querySelectorAll("[data-bubble]"), {
        y: -22,
        opacity: 0,
        duration: 2.4,
        stagger: 0.4,
        repeat: -1,
        ease: "sine.out",
      });
    } else if (slug === "building-materials") {
      gsap.to(root.querySelectorAll("[data-block]"), {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        repeat: -1,
        repeatDelay: 1.2,
        yoyo: true,
        ease: "expo.out",
      });
    } else if (slug === "facility-maintenance") {
      gsap.to(root.querySelector("[data-gear]"), {
        rotate: 360,
        transformOrigin: "32px 32px",
        duration: 12,
        repeat: -1,
        ease: "none",
      });
    } else if (slug === "pest-control") {
      gsap.to(root.querySelectorAll("[data-particle]"), {
        scale: 0,
        opacity: 0,
        duration: 1.2,
        stagger: 0.12,
        repeat: -1,
        repeatDelay: 0.4,
        transformOrigin: "center center",
        ease: "expo.out",
      });
    }
  }, [slug]);

  return (
    <div
      ref={ref}
      data-service-icon
      className={`relative inline-block ${className ?? ""}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-full w-full"
      >
        {slug === "construction" && (
          <>
            {/* Building outline */}
            <path data-draw d="M 18 54 V 28 H 38 V 54" />
            <path data-draw d="M 22 36 H 34" />
            <path data-draw d="M 22 44 H 34" />
            {/* Crane mast */}
            <path data-draw d="M 32 28 V 16" />
            {/* Jib (rotates) */}
            <g data-jib>
              <path data-draw d="M 22 18 L 50 18" />
              <path data-draw d="M 32 16 L 32 18" />
              <line data-draw x1="46" y1="18" x2="46" y2="24" stroke="currentColor" />
              <circle cx="46" cy="26" r="1.6" fill="currentColor" stroke="none" />
            </g>
            {/* Ground */}
            <line data-draw x1="10" y1="54" x2="54" y2="54" />
          </>
        )}

        {slug === "post-construction-cleaning" && (
          <>
            {/* Spray bottle */}
            <path data-draw d="M 26 30 H 38 V 50 A 2 2 0 0 1 36 52 H 28 A 2 2 0 0 1 26 50 Z" />
            <path data-draw d="M 30 30 V 26 H 34 V 30" />
            <path data-draw d="M 34 26 H 42 L 44 22" />
            {/* Bubbles */}
            <circle data-bubble cx="48" cy="38" r="2.5" />
            <circle data-bubble cx="52" cy="44" r="1.8" />
            <circle data-bubble cx="46" cy="50" r="2" />
            {/* Sparkle */}
            <path data-draw d="M 14 16 L 16 22 L 22 24 L 16 26 L 14 32 L 12 26 L 6 24 L 12 22 Z" />
          </>
        )}

        {slug === "building-materials" && (
          <>
            {/* Three stacked blocks (isometric-ish) */}
            <g>
              <path data-draw d="M 12 50 L 28 50 L 32 46 L 16 46 Z" />
              <path data-draw d="M 12 50 V 56 L 28 56 V 50" />
              <path data-draw d="M 28 50 V 56 L 32 52 V 46" />
            </g>
            <g data-block style={{ transform: "translateY(8px)", opacity: 0 }}>
              <path data-draw d="M 22 40 L 38 40 L 42 36 L 26 36 Z" />
              <path data-draw d="M 22 40 V 46 L 38 46 V 40" />
              <path data-draw d="M 38 40 V 46 L 42 42 V 36" />
            </g>
            <g data-block style={{ transform: "translateY(16px)", opacity: 0 }}>
              <path data-draw d="M 32 30 L 48 30 L 52 26 L 36 26 Z" />
              <path data-draw d="M 32 30 V 36 L 48 36 V 30" />
              <path data-draw d="M 48 30 V 36 L 52 32 V 26" />
            </g>
          </>
        )}

        {slug === "facility-maintenance" && (
          <>
            {/* Gear (rotates) */}
            <g data-gear>
              <circle data-draw cx="32" cy="32" r="10" />
              <circle data-draw cx="32" cy="32" r="3.5" />
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * 360) / 8;
                const rad = (angle * Math.PI) / 180;
                const x1 = 32 + Math.cos(rad) * 11;
                const y1 = 32 + Math.sin(rad) * 11;
                const x2 = 32 + Math.cos(rad) * 15;
                const y2 = 32 + Math.sin(rad) * 15;
                return (
                  <line
                    key={i}
                    data-draw
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                  />
                );
              })}
            </g>
            {/* Wrench in corner */}
            <path data-draw d="M 12 14 L 18 20 M 12 14 a 4 4 0 1 1 4 -6 L 16 10 L 18 12 L 16 14 L 14 12 L 12 14" />
          </>
        )}

        {slug === "pest-control" && (
          <>
            {/* Shield outline */}
            <path data-draw d="M 32 12 L 48 18 V 32 C 48 42 40 50 32 54 C 24 50 16 42 16 32 V 18 Z" />
            {/* Cross/check inside */}
            <path data-draw d="M 26 32 L 30 36 L 38 28" />
            {/* Particle dots dispersing */}
            <circle data-particle cx="14" cy="14" r="1.6" fill="currentColor" stroke="none" />
            <circle data-particle cx="50" cy="14" r="1.6" fill="currentColor" stroke="none" />
            <circle data-particle cx="50" cy="50" r="1.6" fill="currentColor" stroke="none" />
            <circle data-particle cx="14" cy="50" r="1.6" fill="currentColor" stroke="none" />
          </>
        )}
      </svg>
    </div>
  );
}

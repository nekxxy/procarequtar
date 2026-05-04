import { useRef } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap } from "../../lib/gsap";

/**
 * Stylised West Bay / Doha skyline silhouette in pure SVG. The towers
 * draw upward on scroll-in via stroke-dashoffset, blinking aviation
 * lights pulse continuously, and a faint horizontal haze line scrubs
 * left-to-right with the scrollbar.
 */
export default function DohaSkyline() {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(ref, () => {
    const root = ref.current;
    if (!root) return;

    const draws = root.querySelectorAll<SVGGeometryElement>("[data-draw]");
    requestAnimationFrame(() => {
      draws.forEach((el) => {
        const len = el.getTotalLength?.() ?? 0;
        if (len > 0) {
          el.setAttribute("stroke-dasharray", String(len));
          el.setAttribute("stroke-dashoffset", String(len));
        }
      });

      gsap.to(draws, {
        strokeDashoffset: 0,
        duration: 1.6,
        stagger: 0.04,
        ease: "expo.out",
        scrollTrigger: { trigger: root, start: "top 88%", once: true },
      });
    });

    // Aviation lights blink
    gsap.to("[data-blink]", {
      opacity: 0.15,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      stagger: { each: 0.4, repeat: -1 },
      ease: "sine.inOut",
    });

    // Sun / moon disk subtly drifts
    gsap.to("[data-disk]", {
      y: -8,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Haze sweeps with scroll
    gsap.fromTo(
      "[data-haze]",
      { x: -120 },
      {
        x: 120,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  }, []);

  // Pre-defined tower silhouettes — proportions inspired by West Bay
  const towers = [
    { x: 30, w: 28, h: 110, kind: "rect" },
    { x: 70, w: 36, h: 150, kind: "twist" },
    { x: 120, w: 22, h: 90, kind: "rect" },
    { x: 150, w: 30, h: 165, kind: "spire" },
    { x: 190, w: 40, h: 120, kind: "round" },
    { x: 240, w: 28, h: 100, kind: "rect" },
    { x: 280, w: 34, h: 175, kind: "asymmetric" },
    { x: 330, w: 26, h: 95, kind: "rect" },
    { x: 370, w: 32, h: 140, kind: "spire" },
    { x: 420, w: 24, h: 105, kind: "rect" },
    { x: 460, w: 38, h: 155, kind: "twist" },
    { x: 510, w: 28, h: 90, kind: "rect" },
    { x: 550, w: 30, h: 130, kind: "spire" },
    { x: 600, w: 26, h: 100, kind: "rect" },
    { x: 640, w: 36, h: 145, kind: "asymmetric" },
    { x: 690, w: 22, h: 80, kind: "rect" },
    { x: 720, w: 32, h: 115, kind: "round" },
    { x: 765, w: 24, h: 85, kind: "rect" },
  ];

  const baseY = 220;

  return (
    <div ref={ref} className="relative w-full" aria-hidden="true">
      <svg
        viewBox="0 0 800 240"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="block h-auto w-full text-current"
        preserveAspectRatio="xMidYEnd meet"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.06" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Sky tint */}
        <rect x="0" y="0" width="800" height="240" fill="url(#sky)" />

        {/* Sun / moon disk */}
        <g data-disk>
          <circle data-draw cx="640" cy="60" r="22" stroke="var(--color-accent)" strokeOpacity="0.7" />
          <circle data-draw cx="640" cy="60" r="14" stroke="var(--color-accent)" strokeOpacity="0.35" />
        </g>

        {/* Haze line that drifts on scroll */}
        <line data-haze x1="-120" y1="170" x2="900" y2="170" stroke="currentColor" strokeOpacity="0.12" />

        {/* Distant water line */}
        <line data-draw x1="0" y1={baseY} x2="800" y2={baseY} strokeOpacity="0.25" />
        <line data-draw x1="0" y1={baseY + 6} x2="800" y2={baseY + 6} strokeOpacity="0.12" />
        <line data-draw x1="0" y1={baseY + 12} x2="800" y2={baseY + 12} strokeOpacity="0.06" />

        {/* Towers */}
        {towers.map((t, i) => {
          const left = t.x;
          const right = t.x + t.w;
          const topY = baseY - t.h;
          const cx = t.x + t.w / 2;

          let body: React.ReactNode = null;
          let tip: React.ReactNode = null;

          if (t.kind === "rect") {
            body = (
              <path
                data-draw
                d={`M ${left} ${baseY} V ${topY} H ${right} V ${baseY}`}
              />
            );
          } else if (t.kind === "spire") {
            body = (
              <path
                data-draw
                d={`M ${left} ${baseY} V ${topY + 16} L ${cx} ${topY} L ${right} ${topY + 16} V ${baseY}`}
              />
            );
            tip = (
              <line
                data-draw
                x1={cx}
                y1={topY}
                x2={cx}
                y2={topY - 14}
                strokeOpacity="0.9"
              />
            );
          } else if (t.kind === "twist") {
            const midY = (baseY + topY) / 2;
            body = (
              <path
                data-draw
                d={`M ${left} ${baseY} V ${midY + 6} L ${left + 4} ${midY} L ${left} ${midY - 6} V ${topY} H ${right} V ${midY - 6} L ${right - 4} ${midY} L ${right} ${midY + 6} V ${baseY}`}
              />
            );
          } else if (t.kind === "round") {
            body = (
              <path
                data-draw
                d={`M ${left} ${baseY} V ${topY + 14} Q ${cx} ${topY - 6} ${right} ${topY + 14} V ${baseY}`}
              />
            );
          } else if (t.kind === "asymmetric") {
            body = (
              <path
                data-draw
                d={`M ${left} ${baseY} V ${topY + 24} L ${right - 4} ${topY} L ${right} ${topY + 8} V ${baseY}`}
              />
            );
          }

          // Window grid: a few horizontal stripes
          const stripes = Math.floor(t.h / 14);
          const gridLines = Array.from({ length: stripes }).map((_, j) => (
            <line
              key={`g-${i}-${j}`}
              data-draw
              x1={left + 2}
              y1={baseY - (j + 1) * 14}
              x2={right - 2}
              y2={baseY - (j + 1) * 14}
              strokeOpacity="0.18"
            />
          ));

          // Aviation light at top of every 3rd tower
          const blink =
            i % 3 === 0 ? (
              <circle
                data-blink
                cx={cx}
                cy={topY - (t.kind === "spire" ? 16 : 4)}
                r="1.8"
                fill="var(--color-accent)"
                stroke="none"
              />
            ) : null;

          return (
            <g key={i}>
              {body}
              {tip}
              {gridLines}
              {blink}
            </g>
          );
        })}

        {/* Foreground subtle hill / shore */}
        <path
          data-draw
          d="M 0 230 Q 200 222 400 230 T 800 230"
          strokeOpacity="0.35"
        />
      </svg>
    </div>
  );
}

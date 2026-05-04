import { useRef } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap, ScrollTrigger } from "../../lib/gsap";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

interface Props {
  items: StatItem[];
}

export default function StatsCounter({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(ref, () => {
    if (!ref.current) return;
    const nodes = ref.current.querySelectorAll<HTMLElement>("[data-stat]");
    nodes.forEach((node) => {
      const target = Number(node.dataset.stat ?? 0);
      const obj = { value: 0 };
      ScrollTrigger.create({
        trigger: node,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            value: target,
            duration: 1.8,
            ease: "expo.out",
            snap: { value: 1 },
            onUpdate: () => {
              node.textContent = String(Math.round(obj.value));
            },
          });
        },
      });
    });

    // Animate the radial dial behind each stat
    const dials = ref.current.querySelectorAll<SVGCircleElement>("[data-dial]");
    dials.forEach((dial) => {
      const circumference = 2 * Math.PI * 44;
      dial.setAttribute("stroke-dasharray", String(circumference));
      dial.setAttribute("stroke-dashoffset", String(circumference));
      ScrollTrigger.create({
        trigger: dial,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(dial, {
            strokeDashoffset: circumference * 0.08,
            duration: 1.8,
            ease: "expo.out",
          });
        },
      });
    });
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-x-10"
    >
      {items.map((item) => (
        <div key={item.label} className="relative flex flex-col gap-3">
          {/* Radial progress dial */}
          <svg
            viewBox="0 0 100 100"
            className="absolute -end-2 -top-2 h-20 w-20 -rotate-90 opacity-40 md:h-24 md:w-24"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeWidth="2"
            />
            <circle
              data-dial
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="display relative z-10 text-5xl md:text-6xl lg:text-7xl">
            <span data-stat={item.value}>0</span>
            <span className="text-[var(--color-accent)]">{item.suffix}</span>
          </div>
          <div className="relative z-10 text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

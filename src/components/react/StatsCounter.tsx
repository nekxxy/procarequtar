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
            duration: 1.6,
            ease: "expo.out",
            snap: { value: 1 },
            onUpdate: () => {
              node.textContent = String(Math.round(obj.value));
            },
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
        <div key={item.label} className="flex flex-col gap-2">
          <div className="display text-5xl md:text-6xl lg:text-7xl">
            <span data-stat={item.value}>0</span>
            <span className="text-[var(--color-accent)]">{item.suffix}</span>
          </div>
          <div className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

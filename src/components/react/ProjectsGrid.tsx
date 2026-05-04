import { useMemo, useState, useRef } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap, ScrollTrigger } from "../../lib/gsap";

export interface ProjectItem {
  title: string;
  service: string;
  serviceLabel: string;
  year: string;
}

interface Props {
  items: ProjectItem[];
  filters: { value: string; label: string }[];
  allLabel: string;
}

export default function ProjectsGrid({ items, filters, allLabel }: Props) {
  const [active, setActive] = useState<string>("all");
  const ref = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    return active === "all" ? items : items.filter((p) => p.service === active);
  }, [active, items]);

  useGsap(ref, () => {
    if (!ref.current) return;
    const cards = ref.current.querySelectorAll<HTMLElement>("[data-project]");
    cards.forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            card,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: "expo.out",
              delay: (i % 4) * 0.05,
            },
          );
        },
      });
    });
  }, [active]);

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive("all")}
          data-cursor-hover
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${
            active === "all"
              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
              : "border-[color-mix(in_srgb,var(--fg)_15%,transparent)]"
          }`}
        >
          {allLabel}
        </button>
        {filters.map((f) => (
          <button
            type="button"
            key={f.value}
            onClick={() => setActive(f.value)}
            data-cursor-hover
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${
              active === f.value
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-[color-mix(in_srgb,var(--fg)_15%,transparent)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div
        ref={ref}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((p) => (
          <article
            key={p.title}
            data-project
            data-cursor-hover
            className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--fg)_8%,transparent)] bg-[color-mix(in_srgb,var(--fg)_4%,transparent)]"
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_srgb,var(--fg)_8%,transparent),transparent_60%)]"
              aria-hidden="true"
            />
            <div className="relative flex h-full flex-col justify-between p-6">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-[var(--muted)]">
                {p.year} · {p.serviceLabel}
              </span>
              <h3 className="display text-2xl leading-tight md:text-3xl">
                {p.title}
              </h3>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

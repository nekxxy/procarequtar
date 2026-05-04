import { useRef, useState } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import ProjectScene from "./ProjectScene";
import type { ServiceSlug } from "../../i18n/utils";

export interface RevealStage {
  slug: ServiceSlug;
  index: string;
  title: string;
  body: string;
}

interface Props {
  stages: RevealStage[];
  eyebrow: string;
}

/**
 * A pinned full-viewport section. Text on the left changes per stage,
 * the scene on the right cross-fades to the matching ProjectScene
 * variant. Driven entirely by scroll progress through the section,
 * not click — so it feels like the page is "playing".
 */
export default function PinnedReveal({ stages, eyebrow }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGsap(ref, () => {
    const root = ref.current;
    if (!root) return;
    const inner = root.querySelector<HTMLDivElement>("[data-pinned-inner]");
    if (!inner) return;

    const total = stages.length;
    ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: () => `+=${total * 600}`,
      pin: inner,
      scrub: 0.5,
      anticipatePin: 1,
      onUpdate: (self) => {
        const idx = Math.min(total - 1, Math.floor(self.progress * total * 0.999));
        setActive(idx);
      },
    });

    // Text crossfade
    const labels = root.querySelectorAll<HTMLElement>("[data-stage-label]");
    labels.forEach((label, i) => {
      gsap.set(label, { autoAlpha: i === 0 ? 1 : 0 });
    });
  }, [stages.length]);

  return (
    <div ref={ref} className="relative w-full">
      <div
        data-pinned-inner
        className="relative grid min-h-[100svh] grid-cols-1 items-center gap-10 overflow-hidden bg-[var(--color-bg-dark)] px-6 py-20 text-[var(--color-fg-dark)] md:grid-cols-2 md:gap-16 md:px-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_85%_15%,var(--color-accent)/0.18,transparent_70%)]"
        />

        {/* Left: text */}
        <div className="relative z-10 flex flex-col gap-8">
          <span className="eyebrow opacity-80">{eyebrow}</span>
          <div className="relative h-[14rem] md:h-[18rem]">
            {stages.map((s, i) => (
              <div
                key={s.slug + i}
                data-stage-label
                className={`absolute inset-0 flex flex-col gap-6 transition-opacity duration-500 ${
                  active === i ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/55">
                  {s.index} / {String(stages.length).padStart(2, "0")}
                </div>
                <h3 className="display text-balance text-4xl md:text-5xl lg:text-6xl">
                  {s.title}
                </h3>
                <p className="max-w-md text-base text-white/65 md:text-lg">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* Stage progress dots */}
          <div className="flex items-center gap-2">
            {stages.map((_, i) => (
              <span
                key={i}
                className={`h-1 transition-all duration-500 ${
                  active === i
                    ? "w-12 bg-[var(--color-accent)]"
                    : "w-6 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: scene crossfade */}
        <div className="relative z-10 grid place-items-center">
          <div className="relative aspect-[4/5] w-full max-w-[520px]">
            {stages.map((s, i) => (
              <div
                key={s.slug + i}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  active === i ? "opacity-100" : "opacity-0"
                }`}
              >
                <ProjectScene
                  slug={s.slug}
                  seed={i + 1}
                  className="h-full text-white/90"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

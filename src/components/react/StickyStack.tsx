import { useRef } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import ServiceIcon from "./ServiceIcon";
import type { ServiceSlug } from "../../i18n/utils";

export interface StickyCard {
  slug: ServiceSlug;
  index: string;
  code: string;
  title: string;
  body: string;
}

interface Props {
  cards: StickyCard[];
}

/**
 * Vertical stack of cards that pin one after the other. Each card stays
 * pinned while the next slides up over it (scale + opacity scrub) and the
 * accent gradient repaints. Reads as a guided tour — a richer alternative
 * to the horizontal services scroller for narrative-driven sections.
 */
export default function StickyStack({ cards }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(ref, () => {
    const root = ref.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>("[data-stack-card]");
    items.forEach((card, i) => {
      const isLast = i === items.length - 1;
      // Each card scales down + fades + tilts as the next one slides over it
      if (!isLast) {
        gsap.to(card, {
          scale: 0.92,
          y: -40,
          opacity: 0.55,
          rotateX: 6,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 14%",
            end: "+=80%",
            scrub: true,
          },
        });
      }
    });

    // Highlight the active card via a thin progress bar inside it
    items.forEach((card) => {
      const bar = card.querySelector("[data-stack-bar]");
      if (!bar) return;
      gsap.to(bar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          end: "top 30%",
          scrub: true,
        },
      });
    });
  }, [cards.length]);

  return (
    <div ref={ref} className="relative">
      {cards.map((c, i) => (
        <article
          key={c.slug + i}
          data-stack-card
          data-cursor-hover
          className="sticky top-[12vh] mb-8 grid grid-cols-1 items-stretch overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-[var(--color-bg-dark)] text-[var(--color-fg-dark)] md:grid-cols-12 md:mb-12"
          style={{
            transformOrigin: "center top",
            transformStyle: "preserve-3d",
            zIndex: 10 + i,
          }}
        >
          {/* Top progress bar */}
          <div className="absolute inset-x-0 top-0 h-px bg-white/10">
            <div
              data-stack-bar
              className="h-full origin-left scale-x-0 bg-[var(--color-accent)]"
            />
          </div>

          <div className="relative flex flex-col justify-between gap-8 p-8 md:col-span-7 md:p-12 lg:p-16">
            <div className="flex items-start justify-between text-[0.65rem] uppercase tracking-[0.25em]">
              <span className="font-mono text-white/45">{c.index} / {String(cards.length).padStart(2, "0")}</span>
              <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-white/65">
                C.R. {c.code}
              </span>
            </div>
            <div>
              <h3 className="display text-balance text-3xl md:text-5xl lg:text-6xl">
                {c.title}
              </h3>
              <p className="mt-6 max-w-xl text-base text-white/65 md:text-lg">
                {c.body}
              </p>
            </div>
          </div>

          {/* Right-side scene panel */}
          <div className="relative grid place-items-center overflow-hidden border-t border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent p-8 md:col-span-5 md:border-t-0 md:border-s md:p-12 lg:p-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,var(--color-accent)/0.18,transparent_70%)]"
            />
            <ServiceIcon
              slug={c.slug}
              className="relative h-40 w-40 text-[var(--color-accent)] md:h-48 md:w-48 lg:h-56 lg:w-56"
            />
          </div>
        </article>
      ))}
    </div>
  );
}

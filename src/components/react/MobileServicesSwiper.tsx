import { useEffect, useRef, useState } from "react";
import ServiceIcon from "./ServiceIcon";
import { localizedHref, type Locale, type ServiceSlug } from "../../i18n/utils";

export interface MobileServiceCard {
  slug: ServiceSlug;
  index: string;
  code: string;
  title: string;
  tagline: string;
  description: string;
}

interface Props {
  cards: MobileServiceCard[];
  lang: Locale;
  ctaLabel: string;
  exploreLabel: string;
}

/**
 * Mobile-only swipe-snap services carousel. Uses native CSS scroll-snap
 * for the gesture (no JS gesture library needed) and tracks the active
 * card to drive a progress dot row + persistent index counter. Each
 * card has a tap-to-open description that auto-collapses when another
 * is tapped.
 */
export default function MobileServicesSwiper({
  cards,
  lang,
  ctaLabel,
  exploreLabel,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cardWidth = el.clientWidth - 48; // approx card width minus gutter
        const idx = Math.round(el.scrollLeft / cardWidth);
        setActive(Math.min(cards.length - 1, Math.max(0, idx)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [cards.length]);

  const scrollToIndex = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const target = el.querySelectorAll<HTMLElement>("[data-service-card]")[idx];
    if (!target) return;
    el.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  return (
    <div className="relative" dir="ltr">
      {/* Top progress meta */}
      <div className="flex items-center justify-between px-5 pb-4 text-[0.7rem] uppercase tracking-[0.25em] text-[var(--muted)]">
        <span className="font-mono">
          <span className="text-[var(--color-accent)]">
            {String(active + 1).padStart(2, "0")}
          </span>
          {" / "}
          {String(cards.length).padStart(2, "0")}
        </span>
        <span className="font-mono">{ctaLabel}</span>
      </div>

      {/* Snap-scroller */}
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card, i) => {
          const isExpanded = expanded === i;
          return (
            <article
              key={card.slug}
              data-service-card
              className="snap-start flex w-[calc(100vw-2.5rem)] max-w-[26rem] shrink-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[var(--color-bg-dark)] text-[var(--color-fg-dark)]"
            >
              <div className="relative flex flex-col gap-6 p-7">
                <div className="flex items-start justify-between text-[0.65rem] uppercase tracking-[0.25em] text-white/55">
                  <span className="font-mono">
                    {card.index} / {String(cards.length).padStart(2, "0")}
                  </span>
                  <span className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[0.6rem]">
                    C.R. {card.code}
                  </span>
                </div>

                <ServiceIcon
                  slug={card.slug}
                  className="h-20 w-20 self-start text-[var(--color-accent)]"
                />

                <div>
                  <h3 className="display text-3xl">{card.title}</h3>
                  <p className="mt-2 text-sm text-white/65">{card.tagline}</p>
                </div>

                {/* Expandable description */}
                <div
                  className="grid transition-[grid-template-rows] duration-500 ease-out"
                  style={{
                    gridTemplateRows: isExpanded ? "1fr" : "0fr",
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-white/10 pt-4 text-sm text-white/70">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : i)}
                    className="inline-flex items-center gap-2 text-sm text-white/75"
                    aria-expanded={isExpanded}
                  >
                    <span
                      className={`relative block h-3 w-3 transition-transform ${
                        isExpanded ? "rotate-45" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
                      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current" />
                    </span>
                    {isExpanded ? "Hide" : "More"}
                  </button>
                  <a
                    href={localizedHref(`/services/${card.slug}`, lang)}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 text-sm font-medium text-black"
                  >
                    {exploreLabel}
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" className="rtl:rotate-180" aria-hidden="true">
                      <path d="M3 9h12M11 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 px-5 pt-2">
        {cards.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to card ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              active === i
                ? "w-8 bg-[var(--color-accent)]"
                : "w-1.5 bg-[var(--muted)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

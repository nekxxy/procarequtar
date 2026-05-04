import { useRef } from "react";
import { useGsap } from "../../hooks/useGsap";
import { useDirection } from "../../hooks/useDirection";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import {
  localizedHref,
  type Locale,
  type ServiceSlug,
} from "../../i18n/utils";
import ServiceIcon from "./ServiceIcon";

export interface ServiceCardData {
  slug: ServiceSlug;
  code: string;
  title: string;
  tagline: string;
  index: string;
}

interface Props {
  cards: ServiceCardData[];
  lang: Locale;
  ctaLabel: string;
}

/**
 * Pinned horizontal scroller. In RTL the track is reversed and the translate
 * sign flipped so cards still enter from the leading edge.
 */
export default function HorizontalServices({ cards, lang, ctaLabel }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { sign } = useDirection();

  useGsap(sectionRef, () => {
    if (!sectionRef.current || !trackRef.current) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    const section = sectionRef.current;
    const track = trackRef.current;

    const getDistance = () =>
      Math.max(track.scrollWidth - window.innerWidth + 80, 0);

    const tween = gsap.to(track, {
      x: () => sign * getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${getDistance()}`,
        scrub: 0.6,
        pin: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      ScrollTrigger.refresh();
    };
  }, [sign]);

  return (
    <div
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-fg-dark)]"
      data-theme-section="dark"
    >
      <div className="grid min-h-[100svh] place-items-center px-6 md:px-10">
        <div
          ref={trackRef}
          className="flex flex-row gap-6 will-change-transform md:gap-8"
        >
          {cards.map((card) => (
            <a
              key={card.slug}
              href={localizedHref(`/services/${card.slug}`, lang)}
              data-cursor-hover
              className="group relative flex w-[88vw] shrink-0 flex-col justify-between overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 transition-colors hover:border-[var(--color-accent)]/60 md:w-[44vw] md:p-10 lg:w-[34vw] lg:min-h-[64vh]"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/50">
                  {card.index} / {String(cards.length).padStart(2, "0")}
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[0.65rem] tracking-widest text-white/60">
                  {card.code}
                </span>
              </div>

              <ServiceIcon
                slug={card.slug}
                className="h-20 w-20 self-start text-[var(--color-accent)] md:h-24 md:w-24"
              />

              <div className="flex flex-col gap-4">
                <h3 className="display text-3xl md:text-4xl lg:text-5xl">
                  {card.title}
                </h3>
                <p className="max-w-md text-sm text-white/65 md:text-base">
                  {card.tagline}
                </p>
                <span className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--color-accent)] transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  {ctaLabel}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                    className="rtl:rotate-180"
                  >
                    <path
                      d="M3 9h12M11 4l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-[var(--color-accent)] opacity-0 blur-[100px] transition-opacity duration-700 group-hover:opacity-30"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

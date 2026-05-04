import { useRef } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import ServiceIcon from "./ServiceIcon";
import { SERVICE_SLUGS } from "../../i18n/utils";

interface Props {
  /** Word strip — repeated infinitely between glyphs */
  words: string[];
  /** Speed in seconds for one base loop */
  speedSec?: number;
}

/**
 * Marquee that adds extra scroll-tied velocity so it speeds up while
 * the user scrolls and gently coasts when they stop. Glyph icons
 * (one per registered service) are interleaved between words.
 */
export default function MarqueeWithScenes({ words, speedSec = 22 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(ref, () => {
    const root = ref.current;
    if (!root) return;
    const tracks = root.querySelectorAll<HTMLElement>("[data-marquee-track]");
    if (!tracks.length) return;

    // Scroll velocity boost — read scrollTrigger velocity and add to track speed
    let lastVelocity = 0;
    ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const v = Math.abs(self.getVelocity?.() ?? 0);
        // Smooth velocity towards target
        lastVelocity += (v - lastVelocity) * 0.15;
        const boost = Math.min(lastVelocity / 1500, 4);
        tracks.forEach((track) => {
          track.style.animationDuration = `${Math.max(speedSec / (1 + boost), 4)}s`;
        });
      },
    });
  }, [speedSec]);

  // Build interleaved sequence of words and slugs
  const sequence: Array<{ kind: "word"; value: string } | { kind: "icon"; slug: typeof SERVICE_SLUGS[number] }> = [];
  for (let i = 0; i < Math.max(words.length, SERVICE_SLUGS.length) * 2; i++) {
    const word = words[i % words.length];
    const slug = SERVICE_SLUGS[i % SERVICE_SLUGS.length];
    if (word) sequence.push({ kind: "word", value: word });
    if (slug) sequence.push({ kind: "icon", slug });
  }

  return (
    <div
      ref={ref}
      className="relative flex w-full overflow-hidden border-y border-[color-mix(in_srgb,var(--fg)_15%,transparent)] bg-[var(--bg)] py-6 md:py-8"
      style={{ ["--mq-speed" as string]: `${speedSec}s` }}
      aria-hidden="true"
    >
      {[0, 1].map((dup) => (
        <div
          key={dup}
          data-marquee-track
          className="flex shrink-0 items-center gap-10 ps-10 will-change-transform md:gap-14"
          style={{ animation: `mqs-scroll var(--mq-speed) linear infinite` }}
        >
          {sequence.map((item, idx) => {
            if (item.kind === "word") {
              return (
                <span
                  key={`${dup}-${idx}`}
                  className="display whitespace-nowrap text-3xl tracking-tight md:text-5xl"
                >
                  {item.value}
                </span>
              );
            }
            return (
              <ServiceIcon
                key={`${dup}-${idx}`}
                slug={item.slug}
                className="h-10 w-10 shrink-0 text-[var(--color-accent)] md:h-14 md:w-14"
              />
            );
          })}
        </div>
      ))}
      <style>{`
        @keyframes mqs-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        :global([dir="rtl"]) [data-marquee-track] {
          animation-direction: reverse;
        }
        @media (prefers-reduced-motion: reduce) {
          [data-marquee-track] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

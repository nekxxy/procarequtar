import { useRef } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap } from "../../lib/gsap";

interface Step {
  index: string;
  title: string;
  body: string;
}

interface Props {
  steps: Step[];
  progressLabel: string;
}

/**
 * Five-step horizontal process diagram. As the user scrolls through the
 * section a horizontal progress line scrubs left-to-right and each step
 * "lights up" as the cursor passes its midpoint. The actual layout is a
 * grid of step cards underneath the SVG track.
 */
export default function ProcessFlow({ steps, progressLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(ref, () => {
    const root = ref.current;
    if (!root) return;
    const progress = root.querySelector<SVGRectElement>("[data-progress]");
    const dots = root.querySelectorAll<SVGCircleElement>("[data-dot]");
    const cards = root.querySelectorAll<HTMLElement>("[data-step-card]");

    if (!progress) return;

    gsap.to(progress, {
      attr: { width: 1000 },
      ease: "none",
      scrollTrigger: {
        trigger: root,
        start: "top 70%",
        end: "bottom 40%",
        scrub: true,
      },
    });

    dots.forEach((dot, i) => {
      const card = cards[i];
      gsap.to(dot, {
        scale: 1.4,
        fill: "var(--color-accent)",
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: `top+=${i * 200} 70%`,
          toggleActions: "play none none reverse",
        },
        transformOrigin: "center center",
      });
      if (card) {
        gsap.fromTo(
          card,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              once: true,
            },
          },
        );
      }
    });
  }, [steps.length]);

  return (
    <div ref={ref} className="relative w-full">
      {/* Track */}
      <svg
        viewBox="0 0 1000 60"
        className="block h-16 w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1="0"
          y1="30"
          x2="1000"
          y2="30"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="2"
        />
        <rect
          data-progress
          x="0"
          y="29"
          width="0"
          height="2"
          fill="var(--color-accent)"
        />
        {steps.map((_, i) => {
          const cx = 50 + i * (900 / (steps.length - 1 || 1));
          return (
            <g key={i}>
              <circle
                data-dot
                cx={cx}
                cy="30"
                r="6"
                fill="var(--color-bg)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.25em] text-[var(--muted)]">
        <span className="font-mono">{progressLabel}</span>
        <span className="font-mono">{steps.length} stages</span>
      </div>

      <div
        className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5"
      >
        {steps.map((s) => (
          <article
            key={s.index}
            data-step-card
            className="group rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--fg)_12%,transparent)] bg-[color-mix(in_srgb,var(--fg)_3%,transparent)] p-6 transition-colors hover:border-[var(--color-accent)]"
          >
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-[var(--muted)]">
              {s.index}
            </div>
            <h3 className="display mt-4 text-2xl">{s.title}</h3>
            <p className="mt-3 text-sm text-[var(--muted)]">{s.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

import { useRef, type ReactNode, type ElementType } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap, ScrollTrigger } from "../../lib/gsap";

interface Props {
  as?: ElementType;
  className?: string;
  /** CSS selector inside the wrapper to stagger. Defaults to direct children. */
  childSelector?: string;
  delay?: number;
  stagger?: number;
  y?: number;
  durationSec?: number;
  start?: string;
  children: ReactNode;
}

export default function RevealOnScroll({
  as: Tag = "div",
  className,
  childSelector,
  delay = 0,
  stagger = 0.08,
  y = 32,
  durationSec = 0.9,
  start = "top 85%",
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGsap(ref, () => {
    const root = ref.current;
    if (!root) return;
    const targets = childSelector
      ? root.querySelectorAll<HTMLElement>(childSelector)
      : (Array.from(root.children) as HTMLElement[]);
    if (!targets.length) return;

    gsap.set(targets, { y, opacity: 0 });
    ScrollTrigger.create({
      trigger: root,
      start,
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          y: 0,
          opacity: 1,
          duration: durationSec,
          ease: "expo.out",
          stagger,
          delay,
        });
      },
    });
  }, []);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}

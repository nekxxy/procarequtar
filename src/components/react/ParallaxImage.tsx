import { useRef, type CSSProperties } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap } from "../../lib/gsap";

interface Props {
  src: string;
  alt: string;
  className?: string;
  /** ±yPercent of travel inside the wrapper. */
  range?: number;
  ratio?: string;
  style?: CSSProperties;
  /** Optional gradient overlay. */
  overlay?: boolean;
}

export default function ParallaxImage({
  src,
  alt,
  className,
  range = 12,
  ratio = "4 / 5",
  style,
  overlay = false,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useGsap(wrap, () => {
    if (!wrap.current || !img.current) return;
    gsap.fromTo(
      img.current,
      { yPercent: -range },
      {
        yPercent: range,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  }, []);

  return (
    <div
      ref={wrap}
      className={`relative overflow-hidden bg-[var(--color-line)] ${className ?? ""}`}
      style={{ aspectRatio: ratio, ...style }}
    >
      <img
        ref={img}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-[120%] w-full -translate-y-[10%] object-cover will-change-transform"
      />
      {overlay && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent"
        />
      )}
    </div>
  );
}

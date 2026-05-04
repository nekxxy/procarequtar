import { useRef, type CSSProperties, type ReactNode } from "react";
import { useTilt } from "../../hooks/useTilt";

interface Props {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  max?: number;
  scale?: number;
}

/**
 * Wraps children in a 3D-tilt card. The tilt only fires on devices
 * with fine pointers and motion enabled — otherwise it's a passthrough.
 */
export default function TiltCard({
  className,
  style,
  children,
  max = 8,
  scale = 1.02,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref, { max, scale });

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

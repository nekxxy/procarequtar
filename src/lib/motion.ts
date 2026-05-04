/**
 * Canonical motion tokens. Match `--ease-*` custom properties in global.css.
 */
export const ease = {
  outExpo: "expo.out",
  outQuint: "quint.out",
  inOutQuart: [0.76, 0, 0.24, 1] as const,
  outBack: "back.out(1.7)",
} as const;

export const duration = {
  xs: 0.25,
  sm: 0.45,
  md: 0.7,
  lg: 1.0,
  xl: 1.4,
  hero: 1.6,
} as const;

export const stagger = {
  tight: 0.025,
  normal: 0.05,
  loose: 0.09,
} as const;

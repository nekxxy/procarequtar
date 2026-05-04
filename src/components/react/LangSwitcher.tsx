import { useEffect, useState } from "react";
import { type Locale } from "../../i18n/utils";

interface Props {
  current: Locale;
  other: Locale;
  otherLabel: string;
}

/**
 * Swaps the locale prefix in the current path and navigates. Falls back to /.
 */
export default function LangSwitcher({ current, other, otherLabel }: Props) {
  const [href, setHref] = useState(`/${other}/`);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    const stripped = path.replace(new RegExp(`^/(en|ar)`), "");
    const sub = stripped.replace(/^\/+|\/+$/g, "");
    setHref(sub ? `/${other}/${sub}/` : `/${other}/`);
  }, [other]);

  return (
    <a
      href={href}
      data-cursor-hover
      hrefLang={other}
      aria-label={`Switch to ${otherLabel}`}
      className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--fg)] hover:text-[var(--color-accent)] transition-colors"
    >
      <span aria-hidden="true">{current === "en" ? "EN" : "ع"}</span>
      <span aria-hidden="true" className="mx-1 opacity-40">/</span>
      <span className="opacity-60">{current === "en" ? "ع" : "EN"}</span>
    </a>
  );
}

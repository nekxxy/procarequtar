import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap } from "../../lib/gsap";
import { localizedHref, type Locale } from "../../i18n/utils";

interface Props {
  lang: Locale;
  labels: {
    menu: string;
    close: string;
    home: string;
    services: string;
    projects: string;
    about: string;
    contact: string;
    language: string;
    other: string;
    otherLabel: string;
  };
}

export default function MobileMenu({ lang, labels }: Props) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    registerGsap();
  }, []);

  useEffect(() => {
    if (!panel.current || !itemsRef.current) return;
    const items = itemsRef.current.querySelectorAll("a");
    if (open) {
      document.documentElement.classList.add("lenis-stopped");
      gsap.to(panel.current, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.7,
        ease: "expo.out",
      });
      gsap.fromTo(
        items,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.05,
          delay: 0.2,
          ease: "expo.out",
        },
      );
    } else {
      gsap.to(panel.current, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.5,
        ease: "expo.inOut",
      });
      document.documentElement.classList.remove("lenis-stopped");
    }
  }, [open]);

  const close = () => setOpen(false);

  const links: Array<{ href: string; label: string }> = [
    { href: localizedHref("/", lang), label: labels.home },
    { href: localizedHref("/services", lang), label: labels.services },
    { href: localizedHref("/projects", lang), label: labels.projects },
    { href: localizedHref("/about", lang), label: labels.about },
    { href: localizedHref("/contact", lang), label: labels.contact },
  ];

  const otherSub = (() => {
    if (typeof window === "undefined") return "/";
    const stripped = window.location.pathname.replace(/^\/(en|ar)/, "");
    return stripped || "/";
  })();
  const otherHref = `/${labels.other}${otherSub.startsWith("/") ? otherSub : `/${otherSub}`}`;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--fg)_18%,transparent)]"
      >
        <span className="sr-only">{open ? labels.close : labels.menu}</span>
        <span className="relative block h-3 w-5">
          <span
            className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300 ${
              open ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-3 h-px w-full bg-current transition-transform duration-300 ${
              open ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      <div
        id="mobile-menu"
        ref={panel}
        className="fixed inset-0 z-40 bg-[var(--color-bg-dark)] text-[var(--color-fg-dark)] md:hidden"
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
        aria-hidden={!open}
      >
        <div
          ref={itemsRef}
          className="flex h-full flex-col justify-between p-6 pt-24"
        >
          <nav className="flex flex-col gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={close}
                className="display text-4xl"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <span className="font-mono text-xs uppercase tracking-[0.25em] opacity-60">
              {labels.language}
            </span>
            <a
              href={otherHref}
              className="font-mono text-xs uppercase tracking-[0.25em]"
            >
              {labels.otherLabel}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

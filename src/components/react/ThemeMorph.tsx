import { useEffect } from "react";
import { registerGsap, ScrollTrigger } from "../../lib/gsap";

/**
 * Sets `<html data-theme="dark|light">` whenever the user enters or leaves a
 * section flagged with `data-theme-section`. CSS handles the actual colour
 * morph via transitions on `body`.
 */
export default function ThemeMorph() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    registerGsap();

    const html = document.documentElement;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-theme-section]"),
    );
    if (!sections.length) return;

    const triggers: ScrollTrigger[] = sections.map((section) =>
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: () =>
          html.setAttribute(
            "data-theme",
            section.dataset.themeSection ?? "light",
          ),
        onEnterBack: () =>
          html.setAttribute(
            "data-theme",
            section.dataset.themeSection ?? "light",
          ),
        onLeave: () => html.setAttribute("data-theme", "light"),
        onLeaveBack: () => html.setAttribute("data-theme", "light"),
      }),
    );

    return () => triggers.forEach((t) => t.kill());
  }, []);

  return null;
}

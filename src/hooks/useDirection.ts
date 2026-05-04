import { useEffect, useState } from "react";

export type Dir = "ltr" | "rtl";

/**
 * Reads `<html dir>` and exposes a sign multiplier for horizontal animation.
 * In RTL, content reads right→left, so x-translates that originate from the
 * right (entering from off-screen) need their sign flipped.
 */
export function useDirection(): { dir: Dir; sign: 1 | -1 } {
  const [dir, setDir] = useState<Dir>("ltr");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const update = () => {
      const value =
        (document.documentElement.getAttribute("dir") as Dir | null) || "ltr";
      setDir(value === "rtl" ? "rtl" : "ltr");
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });
    return () => obs.disconnect();
  }, []);

  return { dir, sign: dir === "rtl" ? 1 : -1 };
}

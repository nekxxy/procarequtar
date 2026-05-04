import { useState } from "react";
import ProjectScene from "./ProjectScene";
import type { ServiceSlug } from "../../i18n/utils";

export interface MobileProject {
  title: string;
  service: ServiceSlug;
  serviceLabel: string;
  year: string;
}

interface Props {
  projects: MobileProject[];
}

/**
 * Mobile project list with tap-to-expand details. One card open at a
 * time. Each card has a ProjectScene preview that animates on first
 * appearance and stays interactive in the expanded state.
 */
export default function MobileProjectsStack({ projects }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ol className="flex flex-col gap-3">
      {projects.map((p, i) => {
        const isOpen = open === i;
        return (
          <li
            key={p.title}
            className={`overflow-hidden rounded-3xl border border-white/10 bg-[var(--color-bg-dark)] text-[var(--color-fg-dark)] transition-colors ${
              isOpen ? "border-[var(--color-accent)]/60" : ""
            }`}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <div className="flex flex-1 items-center gap-4">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/45">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-white/45">
                    {p.year} · {p.serviceLabel}
                  </div>
                  <h3 className="display mt-1 text-lg leading-tight">{p.title}</h3>
                </div>
              </div>
              <span
                aria-hidden="true"
                className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 transition-transform ${
                  isOpen ? "rotate-45 border-[var(--color-accent)]" : ""
                }`}
              >
                <span className="absolute h-px w-3.5 bg-current" />
                <span className="absolute h-3.5 w-px bg-current" />
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-500 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="border-t border-white/10 px-5 pt-5 pb-6">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02]">
                    <ProjectScene
                      slug={p.service}
                      seed={i + 1}
                      className="h-full text-white/85"
                    />
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

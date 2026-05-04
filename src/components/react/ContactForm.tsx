import { useState, type FormEvent } from "react";
import { type Locale } from "../../i18n/utils";

interface Props {
  lang: Locale;
  labels: {
    name: string;
    company: string;
    email: string;
    phone: string;
    service: string;
    selectService: string;
    message: string;
    submit: string;
  };
  services: Array<{ slug: string; title: string }>;
}

export default function ContactForm({ lang, labels, services }: Props) {
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">(
    "idle",
  );

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    const data = new FormData(e.currentTarget);
    // Placeholder: in production wire to Web3Forms / Formspree / serverless.
    await new Promise((r) => setTimeout(r, 600));
    const subject = encodeURIComponent(
      `[${lang.toUpperCase()}] Pro Care enquiry — ${data.get("name")}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${data.get("name")}`,
        `Company: ${data.get("company")}`,
        `Email: ${data.get("email")}`,
        `Phone: ${data.get("phone")}`,
        `Service: ${data.get("service")}`,
        "",
        `${data.get("message")}`,
      ].join("\n"),
    );
    window.location.href = `mailto:hello@procareqatar.com?subject=${subject}&body=${body}`;
    setStatus("ok");
  };

  const inputCls =
    "w-full rounded-md border border-[color-mix(in_srgb,var(--fg)_15%,transparent)] bg-transparent px-4 py-3 text-sm placeholder:text-[var(--muted)] focus:border-[var(--color-accent)] focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-[var(--muted)]">
          {labels.name}
        </span>
        <input required name="name" type="text" className={inputCls} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-[var(--muted)]">
          {labels.company}
        </span>
        <input name="company" type="text" className={inputCls} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-[var(--muted)]">
          {labels.email}
        </span>
        <input required name="email" type="email" className={inputCls} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-[var(--muted)]">
          {labels.phone}
        </span>
        <input name="phone" type="tel" className={inputCls} />
      </label>
      <label className="grid gap-1 text-sm md:col-span-2">
        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-[var(--muted)]">
          {labels.service}
        </span>
        <select required name="service" className={inputCls} defaultValue="">
          <option value="" disabled>
            {labels.selectService}
          </option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm md:col-span-2">
        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-[var(--muted)]">
          {labels.message}
        </span>
        <textarea required name="message" rows={5} className={inputCls} />
      </label>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          data-cursor-hover
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-7 py-4 text-sm font-medium text-black transition-colors hover:bg-[var(--color-accent-2)] disabled:opacity-60"
        >
          {status === "submitting" ? "…" : labels.submit}
          <span className="ms-2 rtl:rotate-180" aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}

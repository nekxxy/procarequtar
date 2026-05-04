import en from "./en.json";
import ar from "./ar.json";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const dictionaries = { en, ar } as const;
export type Dictionary = typeof en;

/** Build-time base, e.g. "/procarequtar" or "" (no trailing slash). */
const BASE = ((import.meta.env.BASE_URL as string) || "/").replace(/\/+$/, "");

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Strip the configured base from a pathname, returning what follows. */
function stripBase(path: string): string {
  if (BASE && path.startsWith(BASE)) return path.slice(BASE.length) || "/";
  return path;
}

export function getLangFromUrl(url: URL): Locale {
  const seg = stripBase(url.pathname).split("/").filter(Boolean)[0];
  return seg && isLocale(seg) ? seg : defaultLocale;
}

export function getDir(lang: Locale): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

/**
 * Strips the locale (and base) prefix from a path, returning the canonical
 * sub-path. `/procarequtar/en/services/contact` → `/services/contact`
 */
export function stripLocale(path: string): string {
  const parts = stripBase(path).split("/").filter(Boolean);
  if (parts.length && isLocale(parts[0]!)) parts.shift();
  return "/" + parts.join("/");
}

/**
 * Returns the equivalent URL in the alternate locale, including base.
 */
export function getAlternateUrl(url: URL, target: Locale): string {
  const sub = stripLocale(url.pathname);
  const trimmed = sub === "/" ? "" : sub.replace(/\/$/, "");
  return `${BASE}/${target}${trimmed}/`;
}

/**
 * Build a localized href from a sub-path (no leading locale).
 * `localizedHref("/services", "ar")` → `/procarequtar/ar/services/`
 */
export function localizedHref(sub: string, lang: Locale): string {
  const clean = sub.replace(/^\/+|\/+$/g, "");
  return clean ? `${BASE}/${lang}/${clean}/` : `${BASE}/${lang}/`;
}

/**
 * Resolves a dotted translation key against the locale dictionary.
 * Falls back to the key itself if not found.
 */
export function t(lang: Locale, key: string): string {
  const dict = dictionaries[lang] as unknown as Record<string, unknown>;
  const value = key.split(".").reduce<unknown>((acc, seg) => {
    if (acc && typeof acc === "object" && seg in (acc as object)) {
      return (acc as Record<string, unknown>)[seg];
    }
    return undefined;
  }, dict);
  return typeof value === "string" ? value : key;
}

/**
 * Resolves a key that may point to an array or object — returns as-is.
 */
export function tn<T = unknown>(lang: Locale, key: string): T {
  const dict = dictionaries[lang] as unknown as Record<string, unknown>;
  const value = key.split(".").reduce<unknown>((acc, seg) => {
    if (acc && typeof acc === "object" && seg in (acc as object)) {
      return (acc as Record<string, unknown>)[seg];
    }
    return undefined;
  }, dict);
  return value as T;
}

export const SERVICE_SLUGS = [
  "construction",
  "post-construction-cleaning",
  "building-materials",
  "facility-maintenance",
  "pest-control",
] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

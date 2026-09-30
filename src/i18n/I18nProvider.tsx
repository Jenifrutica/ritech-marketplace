import * as React from "react";
import { en } from "@/i18n/en";
import { es, type MessageKey } from "@/i18n/es";
import { EXAMPLE_COP_PER_EUR } from "@/domain/rules";

export type Lang = "es" | "en";
const dictionaries: Record<Lang, Record<MessageKey, string>> = { es, en };
const locales: Record<Lang, string> = { es: "es-ES", en: "en-GB" };
const STORAGE_KEY = "ritech.lang";

type Vars = Record<string, string | number>;

type I18n = {
  lang: Lang;
  locale: string;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  eur: (value: number) => string;
  cop: (eurValue: number) => string;
  num: (value: number, digits?: number) => string;
  date: (iso: string) => string;
  dateTime: (iso: string) => string;
  month: (monthIndex: number) => string;
  /** "2026-05" → "mayo de 2026" / "May 2026" */
  monthYear: (yearMonth: string) => string;
};

const I18nContext = React.createContext<I18n | null>(null);

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") return stored;
  } catch {
    // almacenamiento no disponible: se usa español
  }
  return "es";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>(readStoredLang);

  React.useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === "es" ? "RiTech SAS · Marketplace de café y cacao" : "RiTech SAS · Coffee and cacao marketplace";
  }, [lang]);

  const value = React.useMemo<I18n>(() => {
    const locale = locales[lang];
    const dict = dictionaries[lang];
    const eurFmt = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", useGrouping: "always" });
    const copFmt = new Intl.NumberFormat(locale, { style: "currency", currency: "COP", maximumFractionDigits: 0, useGrouping: "always" });
    const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
    const dateTimeFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    const monthFmt = new Intl.DateTimeFormat(locale, { month: "short" });
    const monthYearFmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
    return {
      lang,
      locale,
      setLang: (next) => {
        setLangState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // sin almacenamiento: el idioma solo dura esta sesión
        }
      },
      t: (key, vars) => {
        const template = dict[key] ?? key;
        if (!vars) return template;
        return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
      },
      eur: (v) => eurFmt.format(v),
      cop: (v) => copFmt.format(v * EXAMPLE_COP_PER_EUR),
      num: (v, digits = 0) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits, useGrouping: "always" }).format(v),
      date: (iso) => dateFmt.format(new Date(iso)),
      dateTime: (iso) => dateTimeFmt.format(new Date(iso)),
      month: (m) => monthFmt.format(new Date(2026, m - 1, 1)).replace(".", ""),
      monthYear: (ym) => {
        const [y, m] = ym.split("-").map(Number);
        return monthYearFmt.format(new Date(y, (m || 1) - 1, 1));
      },
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n debe usarse dentro de I18nProvider");
  return ctx;
}

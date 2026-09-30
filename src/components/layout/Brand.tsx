import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/** Logotipo tipográfico con un ícono de la librería; sin ilustraciones propias. */
export function Brand({ to = "/", inverted = false, compact = false }: { to?: string; inverted?: boolean; compact?: boolean }) {
  const { t } = useI18n();
  return (
    <Link
      to={to}
      className={cn(
        "rt-focus flex min-h-11 items-center gap-2.5 no-underline",
        inverted ? "text-[color:var(--on-structure)]" : "text-[color:var(--v-text)]",
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-full",
          inverted ? "bg-[var(--v-pink)] text-[color:var(--v-on-accent)]" : "bg-[var(--v-ink)] text-[color:var(--v-on-ink)]",
        )}
        aria-hidden="true"
      >
        <Icon name="bean" size="sm" />
      </span>
      <span className={cn("grid leading-none", compact && "sr-only sm:not-sr-only")}>
        <span className="rt-display whitespace-nowrap text-[19px] font-semibold">{t("app.name")}</span>
        <span className={cn("mt-1 hidden text-[length:var(--fs-caps)] font-medium sm:block", inverted ? "text-[color:var(--sidebar-muted)]" : "text-[color:var(--v-text-2)]")}>
          Marketplace
        </span>
      </span>
    </Link>
  );
}

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("min-h-11 gap-1.5", className)}
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      aria-label={t("common.switchToLabel")}
    >
      <Icon name="languages" size="sm" />
      <span lang={lang === "es" ? "en" : "es"}>{lang === "es" ? "EN" : "ES"}</span>
    </Button>
  );
}

/**
 * Enlace "saltar al contenido". Con HashRouter un href="#contenido" cambiaría la
 * ruta, así que se mueve el foco al <main> sin tocar el hash.
 */
export function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href="#contenido"
      className="rt-skip"
      onClick={(e) => {
        e.preventDefault();
        const main = document.getElementById("contenido");
        main?.focus();
        main?.scrollIntoView();
      }}
    >
      {t("common.skip")}
    </a>
  );
}

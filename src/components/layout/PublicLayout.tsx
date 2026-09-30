import * as React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brand, LangToggle, SkipLink } from "@/components/layout/Brand";
import { useI18n } from "@/i18n/I18nProvider";

export function SiteFooter({ wide = false }: { wide?: boolean }) {
  const { t } = useI18n();
  return (
    <footer className="border-t border-[var(--v-border)] bg-[var(--v-beige-2)]">
      <div className={`mx-auto flex ${wide ? "max-w-[1400px]" : "max-w-[1200px]"} flex-col gap-3 px-4 py-8 text-[length:var(--fs-small)] text-[color:var(--v-text-2)] sm:px-6 md:flex-row md:items-center md:justify-between`}>
        <div className="grid gap-1">
          <p>{t("landing.footer.project")}</p>
          <p>{t("landing.footer.fake")}</p>
        </div>
        <Link to="/creditos" className="rt-link rt-focus font-medium">
          {t("common.credits")}
        </Link>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--v-canvas)]">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-[var(--v-border)] bg-[var(--v-canvas)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <Brand />
          <div className="flex items-center gap-2">
            <LangToggle />
            <Button asChild size="sm" className="min-h-11">
              <Link to="/ingresar">
                <span className="sm:hidden">{t("common.enterShort")}</span>
                <span className="hidden sm:inline">{t("common.enterDemo")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

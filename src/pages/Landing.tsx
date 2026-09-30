import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { LotCard } from "@/components/common/LotCard";
import { Photo } from "@/components/common/Page";
import { roleIcon, rolePath } from "@/components/layout/roleNav";
import { imageById, imageSrc } from "@/data/imageCredits";
import { ROLES } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";
import { useStore } from "@/store/DemoStore";

export function Landing() {
  const { t } = useI18n();
  const { state, dispatch } = useStore();
  const featured = state.lots.filter((l) => l.status === "published").slice(0, 3);
  const hero = imageById["finca-cafe"];

  return (
    <>
      {/* Hero con foto real y capa sólida semitransparente (sin degradado) */}
      <section className="rt-photo text-[color:#FBF6EC]" aria-labelledby="hero-title">
        <img src={imageSrc("finca-cafe")} alt="" />
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 pb-16 pt-20 sm:px-6 md:pb-24 md:pt-28">
          <div className="max-w-[760px]">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(251,246,236,.14)] px-3 py-1.5 text-[length:var(--fs-small)] font-medium">
              <Icon name="map-pin" size="sm" /> {t("landing.eyebrow")}
            </p>
            <h1 id="hero-title" className="rt-display text-[clamp(34px,6vw,64px)] font-medium leading-[1.02]">
              {t("landing.title")}
            </h1>
            <p className="mt-5 max-w-[620px] text-[clamp(16px,2vw,19px)] leading-relaxed text-[color:#EFE4D3]">{t("landing.lead")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="accent" className="min-h-12">
                <Link to="/ingresar">
                  {t("common.enterDemo")} <Icon name="arrow-right" size="sm" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-12 text-[color:#FBF6EC] [box-shadow:inset_0_0_0_1px_#FBF6EC] hover:bg-[rgba(251,246,236,.14)]">
                <a
                  href="#como-funciona"
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById("how-title");
                    target?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
                    target?.focus({ preventScroll: true });
                  }}
                >
                  {t("landing.ctaSecondary")}
                </a>
              </Button>
            </div>
          </div>
          <dl className="grid max-w-[760px] grid-cols-3 gap-4 border-t border-[rgba(251,246,236,.3)] pt-6">
            {[
              ["1%", "landing.stat.commission"],
              ["100 kg", "landing.stat.min"],
              [t("landing.stat.escrowValue"), "landing.stat.escrow"],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="text-[length:var(--fs-small)] text-[color:#EFE4D3]">{t(label as MessageKey)}</dt>
                <dd className="rt-display text-[clamp(24px,4vw,36px)] font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="rt-credit absolute bottom-2 right-3 text-[color:#EFE4D3]">
          {t("common.photoCredit", { author: hero.author, license: hero.license })}
        </p>
      </section>

      {/* Propuesta de valor */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-20" aria-labelledby="value-title">
        <h2 id="value-title" className="rt-display max-w-[640px] text-[clamp(26px,3.4vw,36px)] font-medium leading-tight">
          {t("landing.value.title")}
        </h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["hand-coins", "landing.value.1"],
            ["shield-check", "landing.value.2"],
            ["lock-keyhole", "landing.value.3"],
          ].map(([icon, key]) => (
            <li key={key}>
              <Card className="h-full">
                <span className="mb-4 grid size-11 place-items-center rounded-full bg-[var(--v-pink-soft)] text-[color:var(--rt-cherry)]">
                  <Icon name={icon} />
                </span>
                <h3 className="rt-display text-[length:var(--fs-title)] font-semibold">{t(`${key}.title` as MessageKey)}</h3>
                <p className="mt-2 leading-relaxed text-[color:var(--v-text-2)]">{t(`${key}.text` as MessageKey)}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* Cómo funciona: sección informativa estática */}
      <section id="como-funciona" className="scroll-mt-20 bg-[var(--v-beige-2)]" aria-labelledby="how-title">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <h2 id="how-title" tabIndex={-1} className="outline-none rt-display text-[clamp(26px,3.4vw,36px)] font-medium leading-tight">
              {t("landing.how.title")}
            </h2>
            <p className="mt-3 text-[length:var(--fs-lead)] text-[color:var(--v-text-2)]">{t("landing.how.lead")}</p>
            <Photo id="sacos-cafe" credit className="mt-8 aspect-[4/3] rounded-[var(--r-panel)]" />
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="flex gap-4 rounded-[var(--r-card)] bg-[var(--v-paper)] p-5 [box-shadow:inset_0_0_0_1px_var(--v-border)]">
                <span className="rt-display grid size-9 shrink-0 place-items-center rounded-full bg-[var(--v-ink)] font-semibold text-[color:var(--v-on-ink)]" aria-hidden="true">
                  {i + 1}
                </span>
                <p className="leading-relaxed">{t(`landing.how.${i + 1}` as MessageKey)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Origen Nariño */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-20" aria-labelledby="origin-title">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Photo id="galeras" credit className="aspect-[16/10] rounded-[var(--r-panel)]" />
          <div>
            <h2 id="origin-title" className="rt-display text-[clamp(26px,3.4vw,36px)] font-medium leading-tight">
              {t("landing.origin.title")}
            </h2>
            <p className="mt-4 text-[length:var(--fs-lead)] leading-relaxed text-[color:var(--v-text-2)]">{t("landing.origin.text")}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Photo id="cafe-flor" className="aspect-square rounded-[var(--r-card)]" />
              <Photo id="cacao-fruto" className="aspect-square rounded-[var(--r-card)]" />
            </div>
          </div>
        </div>
      </section>

      {/* Lotes destacados, sin datos privados */}
      <section className="border-t border-[var(--v-border)]" aria-labelledby="featured-title">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="featured-title" className="rt-display text-[clamp(26px,3.4vw,36px)] font-medium leading-tight">
                {t("landing.featured.title")}
              </h2>
              <p className="mt-2 text-[color:var(--v-text-2)]">{t("landing.featured.lead")}</p>
            </div>
            <Button asChild variant="outline" className="min-h-11">
              <Link
                to={rolePath("buyer", "catalog")}
                onClick={() => dispatch({ type: "setRole", role: "buyer" })}
              >
                {t("nav.catalog")} <Icon name="arrow-right" size="sm" />
              </Link>
            </Button>
          </div>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((lot) => (
              <li key={lot.id}>
                <LotCard lot={lot} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Actores */}
      <section className="bg-[var(--v-structure)] text-[color:var(--on-structure)]" aria-labelledby="roles-title">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-20">
          <h2 id="roles-title" className="rt-display text-[clamp(26px,3.4vw,36px)] font-medium leading-tight">
            {t("landing.roles.title")}
          </h2>
          <p className="mt-2 text-[color:var(--structure-text)]">{t("landing.roles.lead")}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map((role) => (
              <li key={role}>
                <Link
                  to={rolePath(role)}
                  onClick={() => dispatch({ type: "setRole", role })}
                  className="rt-focus flex h-full gap-4 rounded-[var(--r-card)] bg-[var(--structure-quiet)] p-5 text-inherit no-underline hover:[box-shadow:inset_0_0_0_1px_var(--structure-line)]"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--v-pink)] text-[color:var(--v-on-accent)]">
                    <Icon name={roleIcon[role]} size="sm" />
                  </span>
                  <span>
                    <span className="block font-semibold">{t(`role.${role}` as MessageKey)}</span>
                    <span className="mt-1 block text-[length:var(--fs-control)] leading-snug text-[color:var(--structure-text)]">
                      {t(`role.${role}.desc` as MessageKey)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

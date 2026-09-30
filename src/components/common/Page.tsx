import * as React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { EmptyState, EmptyStateDescription, EmptyStateTitle } from "@/components/ui/empty";
import { imageById, imageSrc, type ImageId } from "@/data/imageCredits";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/** Encabezado de cada vista: un solo h1 por página. */
export function PageHeader({
  title,
  lead,
  actions,
  eyebrow,
}: {
  title: React.ReactNode;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <div className="mb-2 text-[length:var(--fs-small)] font-semibold text-[color:var(--rt-cherry)]">{eyebrow}</div>}
        <h1 className="rt-display text-[clamp(28px,4vw,40px)] font-medium leading-[1.08] text-[color:var(--v-text)]">{title}</h1>
        {lead && <p className="mt-3 text-[length:var(--fs-lead)] leading-relaxed text-[color:var(--v-text-2)]">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

export function Section({
  title,
  description,
  children,
  className,
  actions,
  id,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  id?: string;
}) {
  const headingId = React.useId();
  return (
    <section aria-labelledby={id ?? headingId} className={cn("min-w-0", className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={id ?? headingId} className="rt-display text-[length:var(--fs-title)] font-semibold text-[color:var(--v-text)]">
            {title}
          </h2>
          {description && <p className="mt-1 text-[length:var(--fs-control)] text-[color:var(--v-text-2)]">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Kpi({ label, value, icon, note }: { label: string; value: React.ReactNode; icon: string; note?: React.ReactNode }) {
  return (
    <Card size="sm" className="grid gap-2">
      <div className="flex items-center justify-between gap-2 text-[color:var(--v-text-2)]">
        <span className="text-[length:var(--fs-small)] font-medium">{label}</span>
        <Icon name={icon} size="sm" />
      </div>
      <div className="rt-display text-[28px] font-semibold tabular-nums leading-none text-[color:var(--v-text)]">{value}</div>
      {note && <div className="text-[length:var(--fs-meta)] text-[color:var(--v-text-3)]">{note}</div>}
    </Card>
  );
}

export type PendingItem = { id: string; label: string; to: string; icon: string };

/** Bloque "Pendientes": lo primero que ve cada rol, con enlace directo a la acción. */
export function PendingList({ items }: { items: PendingItem[] }) {
  const { t } = useI18n();
  return (
    <Section title={t("common.pending")} description={t("common.pendingIntro")}>
      {items.length === 0 ? (
        <EmptyState variant="filtered" className="min-h-0">
          <EmptyStateTitle>
            <Icon name="circle-check" size="sm" /> {t("common.none")}
          </EmptyStateTitle>
        </EmptyState>
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.to}
                className="rt-focus group flex min-h-[52px] no-underline items-center gap-3 rounded-[var(--r-card-sm)] bg-[var(--v-paper)] px-4 py-3 text-[color:var(--v-text)] [box-shadow:inset_0_0_0_1px_var(--v-border)] hover:[box-shadow:inset_0_0_0_1px_var(--v-edge)]"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--v-pink-soft)] text-[color:var(--rt-cherry)]">
                  <Icon name={item.icon} size="sm" />
                </span>
                <span className="min-w-0 flex-1 font-medium">{item.label}</span>
                <Icon name="chevron-right" size="sm" className="text-[color:var(--v-text-3)] group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

export function EmptyBlock({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <EmptyState>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      <EmptyStateDescription>{text}</EmptyStateDescription>
      {action}
    </EmptyState>
  );
}

/** Foto de stock libre con texto alternativo localizado y atribución opcional. */
export function Photo({
  id,
  className,
  credit = false,
  decorative = false,
  eager = false,
}: {
  id: ImageId | string;
  className?: string;
  credit?: boolean;
  decorative?: boolean;
  eager?: boolean;
}) {
  const { lang, t } = useI18n();
  const meta = imageById[id as ImageId];
  return (
    <figure className={cn("relative m-0 overflow-hidden bg-[var(--v-beige)]", className)}>
      <img
        src={imageSrc(id)}
        alt={decorative ? "" : meta?.alt[lang] ?? ""}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="size-full object-cover"
      />
      {credit && meta && (
        <figcaption className="rt-credit absolute bottom-0 right-0 m-2 rounded-full bg-[rgba(33,22,15,.72)] px-2 py-0.5 text-[#FBF6EC]">
          {t("common.photoCredit", { author: meta.author, license: meta.license })}
        </figcaption>
      )}
    </figure>
  );
}

export function DataList({ items }: { items: { label: React.ReactNode; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <div key={i} className="min-w-0">
          <dt className="text-[length:var(--fs-small)] text-[color:var(--v-text-2)]">{item.label}</dt>
          <dd className="mt-0.5 font-medium text-[color:var(--v-text)]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

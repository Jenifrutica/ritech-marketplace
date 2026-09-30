import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Photo } from "@/components/common/Page";
import { LotStatusBadge, PriceModeBadge } from "@/components/common/StatusBadge";
import type { Lot } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";

/**
 * Tarjeta de lote para compradores. Nunca muestra la finca ni su ubicación
 * (RN-13): solo el origen departamental.
 */
export function LotCard({
  lot,
  to,
  showStatus = false,
  headingLevel = 3,
}: {
  lot: Lot;
  to?: string;
  showStatus?: boolean;
  headingLevel?: 2 | 3;
}) {
  const { t, eur, num } = useI18n();
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const title = `${t(`product.${lot.product}` as MessageKey)} ${lot.variety}`;
  const body = (
    <>
      <Photo id={lot.image} className="aspect-[4/3] w-full" decorative />
      <div className="grid gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <PriceModeBadge mode={lot.priceMode} />
          {showStatus && <LotStatusBadge status={lot.status} />}
        </div>
        <div>
          <div className="text-[length:var(--fs-meta)] font-semibold tracking-wide text-[color:var(--v-text-3)]">{lot.code}</div>
          <Heading className="rt-display text-[length:var(--fs-title)] font-semibold leading-tight text-[color:var(--v-text)]">{title}</Heading>
          <p className="mt-1 text-[length:var(--fs-control)] text-[color:var(--v-text-2)]">
            {t(`process.${lot.process}` as MessageKey)} · {t("lot.originValue")}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-2 border-t border-[var(--v-border)] pt-3 text-[length:var(--fs-small)]">
          <div>
            <dt className="text-[color:var(--v-text-3)]">{t("common.quantity")}</dt>
            <dd className="font-semibold tabular-nums">{t("common.kg", { n: num(lot.quantityKg) })}</dd>
          </div>
          <div>
            <dt className="text-[color:var(--v-text-3)]">{t("common.price")}</dt>
            <dd className="font-semibold tabular-nums">{eur(lot.pricePerKgEur)}</dd>
          </div>
          <div>
            <dt className="text-[color:var(--v-text-3)]">{t("common.score")}</dt>
            <dd className="font-semibold tabular-nums">{num(lot.score, lot.score % 1 ? 2 : 0)}</dd>
          </div>
        </dl>
        <p className="flex items-center gap-1.5 text-[length:var(--fs-meta)] text-[color:var(--rt-leaf)]">
          <Icon name="shield-check" size="sm" /> {t("catalog.certified")}
        </p>
      </div>
    </>
  );
  return (
    <Card className="relative h-full p-0" lift={Boolean(to)}>
      {to ? (
        <Link to={to} className="rt-focus block h-full text-inherit no-underline">
          {body}
        </Link>
      ) : (
        body
      )}
    </Card>
  );
}

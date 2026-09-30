import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { rolePath } from "@/components/layout/roleNav";
import { EmptyBlock, Kpi, PageHeader, PendingList, Section, type PendingItem } from "@/components/common/Page";
import { StageBadge } from "@/components/common/StatusBadge";
import { useNotify } from "@/components/common/Notify";
import { nextShippingStage } from "@/domain/rules";
import type { Transaction } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";
import { useLookups, useStore } from "@/store/DemoStore";

export function CarrierOrders() {
  const { t } = useI18n();
  const { state, me } = useStore();
  const mine = state.transactions.filter((tx) => tx.carrierId === me?.id);
  const active = mine.filter((tx) => nextShippingStage(tx.stage));
  const waiting = mine.filter((tx) => tx.stage === "agreed");
  const done = mine.filter((tx) => !nextShippingStage(tx.stage) && tx.stage !== "agreed");

  const pending: PendingItem[] = active.map((tx) => ({
    id: tx.id,
    label: t("overview.pending.advance", { code: tx.code }),
    to: rolePath("carrier", `transactions/${tx.id}`),
    icon: "truck",
  }));

  return (
    <>
      <PageHeader title={t("carrier.title")} lead={t("carrier.lead")} eyebrow={me?.organization} />
      <div className="grid gap-8">
        <ul className="grid gap-4 sm:grid-cols-3">
          <li><Kpi label={t("overview.kpi.orders")} value={active.length} icon="truck" /></li>
          <li><Kpi label={t("tx.waitSample")} value={waiting.length} icon="history" /></li>
          <li><Kpi label={t("carrier.completed")} value={done.length} icon="circle-check" /></li>
        </ul>
        <PendingList items={pending} />
        <Section title={t("overview.kpi.orders")}>
          {active.length + waiting.length === 0 ? (
            <EmptyBlock title={t("carrier.empty.title")} text={t("carrier.empty.text")} />
          ) : (
            <ul className="grid gap-3">
              {[...active, ...waiting].map((tx) => (
                <li key={tx.id}>
                  <OrderRow tx={tx} />
                </li>
              ))}
            </ul>
          )}
        </Section>
        {done.length > 0 && (
          <Section title={t("carrier.completed")}>
            <ul className="grid gap-3">
              {done.map((tx) => (
                <li key={tx.id}>
                  <OrderRow tx={tx} />
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </>
  );
}

function OrderRow({ tx }: { tx: Transaction }) {
  const { t, num, dateTime } = useI18n();
  const { dispatch } = useStore();
  const { lot: findLot, farm: findFarm, user } = useLookups();
  const notify = useNotify();
  const lot = findLot(tx.lotId)!;
  const farm = findFarm(lot.farmId);
  const buyer = user(tx.buyerId);
  const next = nextShippingStage(tx.stage);
  const last = tx.history.at(-1);
  return (
    <Card className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={rolePath("carrier", `transactions/${tx.id}`)} className="rt-link rt-focus font-semibold">
            {tx.code}
          </Link>
          <StageBadge stage={tx.stage} />
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[color:var(--v-text-2)]">
          <Icon name="map-pin" size="sm" />
          {t("carrier.routeValue", { from: `${farm?.municipality}, Nariño`, to: `${buyer?.city}, ${buyer?.country}` })}
        </p>
        <p className="mt-1 text-[length:var(--fs-small)] text-[color:var(--v-text-3)]">
          {t(`product.${lot.product}` as MessageKey)} {lot.variety} · {t("common.kg", { n: num(tx.quantityKg) })}
          {last && <> · {dateTime(last.at)}</>}
        </p>
      </div>
      {next ? (
        <Button
          className="min-h-11"
          onClick={() => {
            const label = t(`stage.${next}` as MessageKey);
            dispatch({ type: "advanceShipping", txId: tx.id });
            notify(t("tx.advanced", { stage: label }));
          }}
        >
          <Icon name="truck" size="sm" /> {t("tx.advance", { stage: t(`stage.${next}` as MessageKey) })}
        </Button>
      ) : tx.stage === "agreed" ? (
        <span className="flex items-center gap-2 text-[length:var(--fs-small)] text-[color:var(--v-text-2)]">
          <Icon name="history" size="sm" /> {t("tx.waitSample")}
        </span>
      ) : (
        <Button asChild variant="outline" className="min-h-11">
          <Link to={rolePath("carrier", `transactions/${tx.id}`)}>{t("common.viewDetail")}</Link>
        </Button>
      )}
    </Card>
  );
}

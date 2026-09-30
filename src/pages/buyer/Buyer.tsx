import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Notice } from "@/components/common/Notice";
import { BackLink } from "@/components/layout/AppLayout";
import { rolePath } from "@/components/layout/roleNav";
import { LotCard } from "@/components/common/LotCard";
import { DataList, EmptyBlock, Kpi, PageHeader, PendingList, Photo, Section, type PendingItem } from "@/components/common/Page";
import { PriceModeBadge } from "@/components/common/StatusBadge";
import { useNotify } from "@/components/common/Notify";
import { TransactionCards } from "@/pages/shared/Transactions";
import { transactionTotals } from "@/domain/rules";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";
import { useLookups, useStore } from "@/store/DemoStore";

export function BuyerOverview() {
  const { t, eur } = useI18n();
  const { state, me } = useStore();
  const { lot } = useLookups();
  const myTx = state.transactions.filter((tx) => tx.buyerId === me?.id);
  const myNeg = state.negotiations.filter((n) => n.buyerId === me?.id && n.status === "open");
  const held = myTx.filter((tx) => tx.escrow === "held").reduce((sum, tx) => sum + transactionTotals(tx).buyerPays, 0);

  const pending: PendingItem[] = [
    ...myTx
      .filter((tx) => tx.stage === "delivered")
      .map((tx) => ({ id: tx.id, label: t("overview.pending.verify", { code: tx.code }), to: rolePath("buyer", `transactions/${tx.id}`), icon: "clipboard-check" })),
    ...myNeg
      .filter((n) => n.messages.at(-1)?.from !== me?.id)
      .map((n) => ({ id: n.id, label: t("overview.pending.negotiation", { code: lot(n.lotId)?.code ?? "" }), to: rolePath("buyer", `negotiations/${n.id}`), icon: "message-circle" })),
  ];

  return (
    <>
      <PageHeader
        title={t("overview.greeting", { name: me?.name.split(" ")[0] ?? "" })}
        lead={`${me?.organization} · ${me?.city}`}
        actions={
          <Button asChild className="min-h-11">
            <Link to={rolePath("buyer", "catalog")}>
              <Icon name="search" size="sm" /> {t("nav.catalog")}
            </Link>
          </Button>
        }
      />
      <div className="grid gap-8">
        <ul className="grid gap-4 sm:grid-cols-3">
          <li><Kpi label={t("overview.kpi.purchases")} value={myTx.filter((tx) => !["accepted", "resolved"].includes(tx.stage)).length} icon="package" /></li>
          <li><Kpi label={t("overview.kpi.inEscrow")} value={eur(held)} icon="lock-keyhole" /></li>
          <li><Kpi label={t("overview.kpi.openNegotiations")} value={myNeg.length} icon="message-circle" /></li>
        </ul>
        <PendingList items={pending} />
        <Section title={t("nav.purchases")} actions={<Link className="rt-link rt-focus font-medium" to={rolePath("buyer", "purchases")}>{t("common.view")}</Link>}>
          <TransactionCards txs={myTx.slice(0, 3)} role="buyer" />
        </Section>
      </div>
    </>
  );
}

export function Catalog() {
  const { t, num } = useI18n();
  const { state } = useStore();
  const [query, setQuery] = React.useState("");
  const [product, setProduct] = React.useState("all");
  const [mode, setMode] = React.useState("all");
  const [minKg, setMinKg] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");

  const lots = state.lots.filter((l) => {
    if (l.status === "sold") return false;
    if (product !== "all" && l.product !== product) return false;
    if (mode !== "all" && l.priceMode !== mode) return false;
    if (minKg && l.quantityKg < Number(minKg)) return false;
    if (maxPrice && l.pricePerKgEur > Number(maxPrice.replace(",", "."))) return false;
    if (query.trim()) {
      const hay = `${l.code} ${l.variety} ${t(`process.${l.process}` as MessageKey)} ${t(`product.${l.product}` as MessageKey)}`.toLowerCase();
      if (!hay.includes(query.trim().toLowerCase())) return false;
    }
    return true;
  });
  const clear = () => {
    setQuery("");
    setProduct("all");
    setMode("all");
    setMinKg("");
    setMaxPrice("");
  };

  return (
    <>
      <PageHeader title={t("catalog.title")} lead={t("catalog.lead")} />
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="mb-6 grid gap-4 rounded-[var(--r-card)] bg-[var(--v-paper)] p-4 [box-shadow:inset_0_0_0_1px_var(--v-border)] md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]"
      >
        <Field>
          <FieldLabel>{t("catalog.search")}</FieldLabel>
          <FieldControl>
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </FieldControl>
        </Field>
        <Field>
          <FieldLabel>{t("catalog.filter.product")}</FieldLabel>
          <FieldControl>
            <NativeSelect value={product} onChange={(e) => setProduct(e.target.value)}>
              <NativeSelectOption value="all">{t("common.all")}</NativeSelectOption>
              <NativeSelectOption value="coffee">{t("product.coffee")}</NativeSelectOption>
              <NativeSelectOption value="cacao">{t("product.cacao")}</NativeSelectOption>
            </NativeSelect>
          </FieldControl>
        </Field>
        <Field>
          <FieldLabel>{t("catalog.filter.priceMode")}</FieldLabel>
          <FieldControl>
            <NativeSelect value={mode} onChange={(e) => setMode(e.target.value)}>
              <NativeSelectOption value="all">{t("common.all")}</NativeSelectOption>
              <NativeSelectOption value="fixed">{t("priceMode.fixed")}</NativeSelectOption>
              <NativeSelectOption value="negotiable">{t("priceMode.negotiable")}</NativeSelectOption>
            </NativeSelect>
          </FieldControl>
        </Field>
        <Field>
          <FieldLabel>{t("catalog.filter.minKg")}</FieldLabel>
          <FieldControl>
            <Input inputMode="numeric" value={minKg} onChange={(e) => setMinKg(e.target.value.replace(/[^\d]/g, ""))} />
          </FieldControl>
        </Field>
        <Field>
          <FieldLabel>{t("catalog.filter.maxPrice")}</FieldLabel>
          <FieldControl>
            <Input inputMode="decimal" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value.replace(/[^\d.,]/g, ""))} />
          </FieldControl>
        </Field>
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="font-medium text-[color:var(--v-text-2)]">
          {t("catalog.results", { n: num(lots.length) })}
        </p>
        <p className="flex items-center gap-1.5 text-[length:var(--fs-small)] text-[color:var(--v-text-2)]">
          <Icon name="eye-off" size="sm" /> {t("catalog.privateHint")}
        </p>
      </div>

      {lots.length === 0 ? (
        <EmptyBlock
          title={t("catalog.empty.title")}
          text={t("catalog.empty.text")}
          action={
            <Button variant="outline" onClick={clear}>
              {t("catalog.filter.clear")}
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {lots.map((lot) => (
            <li key={lot.id}>
              <LotCard lot={lot} to={rolePath("buyer", `catalog/${lot.id}`)} headingLevel={2} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function LotDetail() {
  const { lotId = "" } = useParams();
  const { t, eur, num, monthYear } = useI18n();
  const { state, dispatch, me, newId } = useStore();
  const { lot: findLot } = useLookups();
  const navigate = useNavigate();
  const notify = useNotify();
  const lot = findLot(lotId);

  if (!lot || lot.status === "sold") {
    return (
      <>
        <BackLink to={rolePath("buyer", "catalog")} label={t("nav.catalog")} />
        <EmptyBlock title={t("notFound.title")} text={t("lot.notFound")} />
      </>
    );
  }
  const existing = state.negotiations.find((n) => n.lotId === lot.id && n.buyerId === me?.id);
  const blocked = me?.status === "blocked";
  const title = `${t(`product.${lot.product}` as MessageKey)} ${lot.variety}`;

  const start = () => {
    if (!me) return;
    const id = newId("n");
    dispatch({ type: "startNegotiation", lotId: lot.id, buyerId: me.id, id });
    notify(t("lot.negotiationStarted"));
    navigate(rolePath("buyer", `negotiations/${id}`));
  };

  return (
    <>
      <BackLink to={rolePath("buyer", "catalog")} label={t("nav.catalog")} />
      <PageHeader eyebrow={lot.code} title={title} lead={`${t(`process.${lot.process}` as MessageKey)} · ${t("lot.originValue")}`} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Photo id={lot.image} credit eager className="aspect-[4/3] rounded-[var(--r-panel)]" />
        <div className="grid content-start gap-6">
          <Card>
            <div className="mb-4 flex flex-wrap gap-2">
              <PriceModeBadge mode={lot.priceMode} />
            </div>
            <p className="rt-display text-[36px] font-semibold leading-none tabular-nums">
              {eur(lot.pricePerKgEur)}
              <span className="ms-1 text-[length:var(--fs-body)] font-normal text-[color:var(--v-text-2)]">/ kg</span>
            </p>
            {lot.priceMode === "negotiable" && <p className="mt-1 text-[length:var(--fs-small)] text-[color:var(--v-text-2)]">{t("lot.referencePrice")}</p>}
            <div className="mt-6">
              <DataList
                items={[
                  { label: t("lot.available"), value: t("common.kg", { n: num(lot.quantityKg) }) },
                  { label: t(`score.${lot.product}` as MessageKey), value: num(lot.score, 2) },
                  { label: t("common.variety"), value: lot.variety },
                  { label: t("common.harvest"), value: monthYear(lot.harvest) },
                  { label: t("lot.origin"), value: t("lot.originValue") },
                  { label: t("common.product"), value: t(`product.${lot.product}` as MessageKey) },
                ]}
              />
            </div>
            <div className="mt-6">
              {existing ? (
                <Button asChild size="lg" fullWidth className="min-h-12">
                  <Link to={rolePath("buyer", `negotiations/${existing.id}`)}>
                    <Icon name="message-circle" size="sm" /> {t("lot.goToNegotiation")}
                  </Link>
                </Button>
              ) : (
                <Button size="lg" fullWidth className="min-h-12" onClick={start} disabled={blocked}>
                  <Icon name="message-circle" size="sm" /> {t("lot.startNegotiation")}
                </Button>
              )}
              {blocked && <p className="mt-2 text-[length:var(--fs-small)] text-[color:var(--v-danger-ink)]">{t("lot.blockedBuyer")}</p>}
            </div>
          </Card>
          {/* RN-13: la finca y su ubicación son privadas hasta negociar */}
          <Notice icon="eye-off" variant="info">
<AlertTitle>{t("catalog.privateLocation")}
            </AlertTitle>
            <AlertDescription>{t("catalog.privateHint")}</AlertDescription>
          </Notice>
          <p className="flex items-center gap-2 text-[color:var(--rt-leaf)]">
            <Icon name="shield-check" size="sm" /> {t("catalog.certified")}
          </p>
        </div>
      </div>
    </>
  );
}

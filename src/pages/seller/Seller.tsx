import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Notice } from "@/components/common/Notice";
import { BarChart } from "@/components/ui/bar-chart";
import { rolePath } from "@/components/layout/roleNav";
import { LotCard } from "@/components/common/LotCard";
import { EmptyBlock, Kpi, PageHeader, PendingList, Section, type PendingItem } from "@/components/common/Page";
import { useNotify } from "@/components/common/Notify";
import { monthlySales } from "@/data/seed";
import { commission, validateQuantity } from "@/domain/rules";
import type { Lot, Product } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";
import { useLookups, useStore } from "@/store/DemoStore";

export function SellerOverview() {
  const { t, eur, month } = useI18n();
  const { state, me } = useStore();
  const { lot } = useLookups();
  const myLots = state.lots.filter((l) => l.sellerId === me?.id);
  const openNeg = state.negotiations.filter((n) => n.sellerId === me?.id && n.status === "open");
  const myTx = state.transactions.filter((tx) => tx.sellerId === me?.id);
  const salesYear = myTx.filter((tx) => tx.escrow === "released").reduce((s, tx) => s + tx.quantityKg * tx.pricePerKgEur, 0);

  const pending: PendingItem[] = openNeg
    .filter((n) => n.messages.at(-1)?.from !== me?.id)
    .map((n) => ({
      id: n.id,
      label: t("overview.pending.negotiation", { code: lot(n.lotId)?.code ?? "" }),
      to: rolePath("seller", `negotiations/${n.id}`),
      icon: "message-circle",
    }));

  const data = monthlySales.map((m) => ({ label: month(m.month), coffee: m.coffee, cacao: m.cacao }));

  return (
    <>
      <PageHeader
        title={t("overview.greeting", { name: me?.name.split(" ")[0] ?? "" })}
        lead={me?.organization}
        actions={
          <Button asChild className="min-h-11">
            <Link to={rolePath("seller", "publish")}>
              <Icon name="plus" size="sm" /> {t("nav.publish")}
            </Link>
          </Button>
        }
      />
      <div className="grid gap-8">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <li><Kpi label={t("overview.kpi.activeLots")} value={myLots.filter((l) => l.status !== "sold").length} icon="store" /></li>
          <li><Kpi label={t("overview.kpi.openNegotiations")} value={openNeg.length} icon="message-circle" /></li>
          <li><Kpi label={t("overview.kpi.inEscrow")} value={myTx.filter((tx) => tx.escrow === "held").length} icon="lock-keyhole" /></li>
          <li><Kpi label={t("overview.kpi.salesYear")} value={eur(salesYear)} icon="banknote" /></li>
        </ul>
        <PendingList items={pending} />
        <Card>
          <SalesChart data={data} />
        </Card>
      </div>
    </>
  );
}

function SalesChart({ data }: { data: { label: string; coffee: number; cacao: number }[] }) {
  const { t, eur } = useI18n();
  return (
    <BarChart
      caption={t("overview.salesChart")}
      description={t("overview.salesChartDesc")}
      data={data}
      series={[
        { key: "coffee", label: t("product.coffee"), color: "pink" },
        { key: "cacao", label: t("product.cacao"), color: "olive" },
      ]}
      valueFormatter={(v) => eur(v)}
      labels={{ hint: t("chart.hint"), showData: t("chart.showData"), hideData: t("chart.hideData") }}
      showTable
    />
  );
}

export function PublishLot() {
  const { t, eur, num } = useI18n();
  const { state, dispatch, me } = useStore();
  const notify = useNotify();
  const navigate = useNavigate();
  const myFarms = state.farms.filter((f) => f.sellerId === me?.id);
  const enabled = myFarms.filter((f) => f.eudr === "enabled");

  const [farmId, setFarmId] = React.useState(enabled[0]?.id ?? "");
  const farm = myFarms.find((f) => f.id === farmId);
  const [product, setProduct] = React.useState<Product>(farm?.products[0] ?? "coffee");
  const [variety, setVariety] = React.useState(farm?.varieties[0] ?? "");
  const [process, setProcess] = React.useState<Lot["process"]>("washed");
  const [qty, setQty] = React.useState("");
  const [priceMode, setPriceMode] = React.useState<Lot["priceMode"]>("fixed");
  const [price, setPrice] = React.useState("");
  const [harvest, setHarvest] = React.useState("2026-09");
  const [submitted, setSubmitted] = React.useState(false);
  const [qtyTouched, setQtyTouched] = React.useState(false);

  const qtyValue = qty === "" ? null : Number(qty);
  const priceValue = Number(price.replace(",", "."));
  const errors = {
    qty: validateQuantity(qtyValue),
    price: !(priceValue > 0),
    variety: !variety.trim(),
  };
  const hasErrors = Boolean(errors.qty || errors.price || errors.variety || !farm);
  const showQty = (submitted || qtyTouched) && errors.qty;
  const processes: Lot["process"][] = product === "coffee" ? ["washed", "honey", "natural"] : ["fermented"];

  const onFarmChange = (id: string) => {
    setFarmId(id);
    const f = myFarms.find((x) => x.id === id);
    if (f) {
      setProduct(f.products[0]);
      setVariety(f.varieties[0] ?? "");
      setProcess(f.products[0] === "coffee" ? "washed" : "fermented");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors || !me || !farm) return;
    const code = `NAR-${Math.max(...state.lots.map((l) => Number(l.code.split("-")[1]))) + 1}`;
    dispatch({
      type: "publishLot",
      lot: {
        sellerId: me.id,
        farmId: farm.id,
        product,
        variety: variety.trim(),
        process,
        quantityKg: qtyValue!,
        priceMode,
        pricePerKgEur: priceValue,
        score: product === "coffee" ? 85 : 80,
        harvest,
        image: product === "coffee" ? "cereza-cafe" : "cacao-fruto",
      },
    });
    notify(t("publish.done", { code }));
    navigate(rolePath("seller", "lots"));
  };

  return (
    <>
      <PageHeader title={t("publish.title")} lead={t("publish.lead")} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <form noValidate onSubmit={submit} className="grid gap-6">
            {submitted && hasErrors && (
              <Notice variant="danger" role="alert">
                <AlertTitle>{t("publish.errors")}</AlertTitle>
              </Notice>
            )}
            <Field>
              <FieldLabel>{t("publish.farm")}</FieldLabel>
              <FieldControl>
                <NativeSelect value={farmId} onChange={(e) => onFarmChange(e.target.value)}>
                  {myFarms.map((f) => (
                    <NativeSelectOption key={f.id} value={f.id} disabled={f.eudr !== "enabled"}>
                      {f.eudr === "enabled" ? `${f.name} · ${f.municipality}` : t("publish.farmDisabled", { farm: f.name })}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FieldControl>
            </Field>

            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel>{t("publish.product")}</FieldLabel>
                <FieldControl>
                  <NativeSelect
                    value={product}
                    onChange={(e) => {
                      const p = e.target.value as Product;
                      setProduct(p);
                      setProcess(p === "coffee" ? "washed" : "fermented");
                    }}
                  >
                    {(farm?.products ?? ["coffee"]).map((p) => (
                      <NativeSelectOption key={p} value={p}>
                        {t(`product.${p}` as MessageKey)}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </FieldControl>
              </Field>
              <Field invalid={submitted && errors.variety}>
                <FieldLabel>{t("publish.variety")}</FieldLabel>
                <FieldControl>
                  <Input value={variety} onChange={(e) => setVariety(e.target.value)} list="varieties" required />
                </FieldControl>
                <datalist id="varieties">
                  {farm?.varieties.map((v) => <option key={v} value={v} />)}
                </datalist>
                {submitted && errors.variety && <FieldError>{t("publish.varietyError")}</FieldError>}
              </Field>
              <Field>
                <FieldLabel>{t("publish.process")}</FieldLabel>
                <FieldControl>
                  <NativeSelect value={process} onChange={(e) => setProcess(e.target.value as Lot["process"])}>
                    {processes.map((p) => (
                      <NativeSelectOption key={p} value={p}>
                        {t(`process.${p}` as MessageKey)}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </FieldControl>
              </Field>
              <Field>
                <FieldLabel>{t("publish.harvest")}</FieldLabel>
                <FieldControl>
                  <Input type="month" value={harvest} onChange={(e) => setHarvest(e.target.value)} max="2026-12" />
                </FieldControl>
              </Field>
              {/* RN-1: mínimo 100 kg, con validación en línea */}
              <Field invalid={Boolean(showQty)}>
                <FieldLabel>{t("publish.quantity")}</FieldLabel>
                <FieldControl>
                  <Input
                    inputMode="numeric"
                    value={qty}
                    onChange={(e) => setQty(e.target.value.replace(/[^\d]/g, ""))}
                    onBlur={() => setQtyTouched(true)}
                    required
                  />
                </FieldControl>
                {showQty ? (
                  <FieldError>{t(`neg.qtyError.${errors.qty}` as MessageKey, { n: "" })}</FieldError>
                ) : (
                  <FieldDescription>{t("publish.quantityHint")}</FieldDescription>
                )}
              </Field>
              <Field invalid={submitted && errors.price}>
                <FieldLabel>{t("publish.price")}</FieldLabel>
                <FieldControl>
                  <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ""))} required />
                </FieldControl>
                {submitted && errors.price ? (
                  <FieldError>{t("publish.priceError")}</FieldError>
                ) : (
                  <FieldDescription>{priceMode === "fixed" ? t("publish.priceHintFixed") : t("publish.priceHintNegotiable")}</FieldDescription>
                )}
              </Field>
            </div>

            <FieldSet>
              <FieldLegend className="text-[length:var(--fs-control)]">{t("publish.priceMode")}</FieldLegend>
              <RadioGroup value={priceMode} onValueChange={(v) => setPriceMode(v as Lot["priceMode"])} className="flex flex-wrap gap-4">
                {(["fixed", "negotiable"] as const).map((m) => (
                  <label key={m} className="flex min-h-11 cursor-pointer items-center gap-2">
                    <RadioGroupItem value={m} />
                    {t(`priceMode.${m}` as MessageKey)}
                  </label>
                ))}
              </RadioGroup>
            </FieldSet>

            <Button type="submit" size="lg" className="min-h-12 w-full sm:w-fit">
              <Icon name="store" size="sm" /> {t("publish.submit")}
            </Button>
          </form>
        </Card>

        <aside className="grid content-start gap-4" aria-label={t("publish.preview")}>
          <h2 className="rt-display text-[length:var(--fs-title)] font-semibold">{t("publish.preview")}</h2>
          <LotCard
            lot={{
              id: "preview",
              code: "NAR-····",
              sellerId: me?.id ?? "",
              farmId,
              product,
              variety: variety || "—",
              process,
              quantityKg: qtyValue ?? 0,
              priceMode,
              pricePerKgEur: priceValue || 0,
              score: product === "coffee" ? 85 : 80,
              harvest,
              status: "published",
              image: product === "coffee" ? "cereza-cafe" : "cacao-fruto",
              publishedAt: new Date().toISOString(),
            }}
          />
          {!errors.qty && !errors.price && (
            <p className="text-[length:var(--fs-small)] text-[color:var(--v-text-2)]">
              {t("publish.feePreview", { fee: eur(commission((qtyValue ?? 0) * priceValue)) })} · {t("common.kg", { n: num(qtyValue ?? 0) })}
            </p>
          )}
          {myFarms.some((f) => f.eudr !== "enabled") && (
            <Notice variant="warn">
              <AlertDescription>{t("farms.eudrHelp")}</AlertDescription>
            </Notice>
          )}
        </aside>
      </div>
    </>
  );
}

export function MyLots() {
  const { t } = useI18n();
  const { state, me } = useStore();
  const lots = state.lots.filter((l) => l.sellerId === me?.id);
  return (
    <>
      <PageHeader
        title={t("myLots.title")}
        lead={t("myLots.lead")}
        actions={
          <Button asChild className="min-h-11">
            <Link to={rolePath("seller", "publish")}>
              <Icon name="plus" size="sm" /> {t("nav.publish")}
            </Link>
          </Button>
        }
      />
      {lots.length === 0 ? (
        <EmptyBlock title={t("tx.empty.title")} text={t("publish.lead")} />
      ) : (
        <Section title={t("catalog.results", { n: lots.length })}>
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {lots.map((lot) => (
              <li key={lot.id}>
                <LotCard lot={lot} showStatus />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

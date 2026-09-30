import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Field, FieldControl, FieldError, FieldLabel } from "@/components/ui/field";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Notice } from "@/components/common/Notice";
import { Bubble, BubbleContent, BubbleRow, BubbleTime } from "@/components/ui/bubble";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BackLink } from "@/components/layout/AppLayout";
import { rolePath } from "@/components/layout/roleNav";
import { DataList, EmptyBlock, PageHeader, Photo } from "@/components/common/Page";
import { NegotiationBadge, PriceModeBadge } from "@/components/common/StatusBadge";
import { useNotify } from "@/components/common/Notify";
import { MoneySummary } from "@/pages/shared/Transactions";
import { transactionTotals, validateQuantity } from "@/domain/rules";
import type { Role } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";
import { useLookups, useStore } from "@/store/DemoStore";

export function NegotiationList({ role }: { role: Extract<Role, "buyer" | "seller"> }) {
  const { t, dateTime } = useI18n();
  const { state, me } = useStore();
  const { lot, user } = useLookups();
  const mine = state.negotiations.filter((n) => (role === "buyer" ? n.buyerId : n.sellerId) === me?.id);

  return (
    <>
      <PageHeader title={t("neg.title")} lead={t("neg.lead")} />
      {mine.length === 0 ? (
        <EmptyBlock
          title={t("neg.empty.title")}
          text={t("neg.empty.text")}
          action={
            role === "buyer" && (
              <Button asChild>
                <Link to={rolePath("buyer", "catalog")}>{t("nav.catalog")}</Link>
              </Button>
            )
          }
        />
      ) : (
        <ul className="grid gap-3">
          {mine.map((n) => {
            const l = lot(n.lotId);
            const other = user(role === "buyer" ? n.sellerId : n.buyerId);
            const last = n.messages.at(-1);
            if (!l) return null;
            return (
              <li key={n.id}>
                <Link
                  to={rolePath(role, `negotiations/${n.id}`)}
                  className="rt-focus flex flex-col gap-3 rounded-[var(--r-card)] bg-[var(--v-paper)] p-4 text-inherit no-underline [box-shadow:inset_0_0_0_1px_var(--v-border)] hover:[box-shadow:inset_0_0_0_1px_var(--v-edge)] sm:flex-row sm:items-center"
                >
                  <Photo id={l.image} decorative className="h-20 w-full shrink-0 rounded-[var(--r-card-sm)] sm:w-28" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {t(`product.${l.product}` as MessageKey)} {l.variety} · {l.code}
                      </span>
                      <NegotiationBadge status={n.status} />
                    </div>
                    <p className="mt-1 text-[length:var(--fs-control)] text-[color:var(--v-text-2)]">
                      {t("neg.with", { name: `${other?.name} (${other?.organization})` })}
                    </p>
                    {last && (
                      <p className="mt-1 truncate text-[length:var(--fs-small)] text-[color:var(--v-text-3)]">
                        {dateTime(last.at)} · {last.text}
                      </p>
                    )}
                  </div>
                  <Icon name="chevron-right" size="sm" className="hidden text-[color:var(--v-text-3)] sm:block" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export function NegotiationDetail({ role }: { role: Extract<Role, "buyer" | "seller"> }) {
  const { id = "" } = useParams();
  const { t, eur, num, dateTime, date } = useI18n();
  const { state, dispatch, me, newId } = useStore();
  const { lot: findLot, farm: findFarm, user, certsOf } = useLookups();
  const notify = useNotify();
  const navigate = useNavigate();
  const neg = state.negotiations.find((n) => n.id === id);
  const lot = neg && findLot(neg.lotId);
  const [text, setText] = React.useState("");
  const [price, setPrice] = React.useState(String(neg?.offerPerKgEur ?? ""));
  const [qty, setQty] = React.useState(String(neg?.offerQuantityKg ?? ""));
  const [touched, setTouched] = React.useState(false);
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [neg?.messages.length]);

  if (!neg || !lot || !me) {
    return (
      <>
        <BackLink to={rolePath(role, "negotiations")} />
        <EmptyBlock title={t("notFound.title")} text={t("lot.notFound")} />
      </>
    );
  }

  const farm = findFarm(lot.farmId);
  const other = user(role === "buyer" ? neg.sellerId : neg.buyerId);
  const buyer = user(neg.buyerId);
  const open = neg.status === "open";
  const blocked = buyer?.status === "blocked";
  const priceValue = Number(price.replace(",", "."));
  const qtyValue = qty.trim() === "" ? null : Number(qty);
  const qtyError = validateQuantity(qtyValue, lot.quantityKg);
  const priceError = !(priceValue > 0);
  const offerValid = !qtyError && !priceError;
  const totals = transactionTotals({ quantityKg: qtyValue ?? 0, pricePerKgEur: priceValue || 0 });
  const title = `${t(`product.${lot.product}` as MessageKey)} ${lot.variety}`;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: "sendMessage", negotiationId: neg.id, from: me.id, text: text.trim() });
    setText("");
  };

  const saveOffer = () => {
    setTouched(true);
    if (!offerValid) return;
    dispatch({ type: "updateOffer", negotiationId: neg.id, pricePerKg: priceValue, quantityKg: qtyValue! });
    notify(t("neg.offerUpdated"));
  };

  const agree = () => {
    const txId = newId("t");
    dispatch({ type: "updateOffer", negotiationId: neg.id, pricePerKg: priceValue, quantityKg: qtyValue! });
    dispatch({ type: "agree", negotiationId: neg.id, txId });
    notify(t("neg.agreed"));
    navigate(rolePath(role, `transactions/${txId}`));
  };

  return (
    <>
      <BackLink to={rolePath(role, "negotiations")} label={t("neg.title")} />
      <PageHeader
        eyebrow={lot.code}
        title={title}
        lead={t("neg.with", { name: `${other?.name} · ${other?.organization}` })}
        actions={<NegotiationBadge status={neg.status} />}
      />

      {!open && neg.transactionId && (
        <Notice icon="lock" variant="ok" className="mb-6">
<AlertTitle>{t("tx.locked")}
          </AlertTitle>
          <AlertDescription>
            <Link className="rt-link rt-focus font-medium" to={rolePath(role, `transactions/${neg.transactionId}`)}>
              {t("neg.viewTransaction")}
            </Link>
          </AlertDescription>
        </Notice>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Chat */}
        <Card className="grid content-start gap-4 self-start">
          <h2 className="rt-display text-[length:var(--fs-title)] font-semibold">{t("neg.chatLabel", { code: lot.code })}</h2>
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label={t("neg.chatLabel", { code: lot.code })}
            tabIndex={0}
            className="rt-focus min-h-[320px] max-h-[560px] overflow-y-auto rounded-[var(--r-card)]"
          >
            <Bubble className="grid gap-3">
              {neg.messages.map((m) => {
                const mine = m.from === me.id;
                const author = mine ? t("neg.youLabel") : user(m.from)?.name;
                return (
                  <div key={m.id} className={mine ? "grid justify-items-end" : "grid justify-items-start"}>
                    <BubbleRow variant={mine ? "me" : "default"}>
                      <BubbleContent variant={mine ? "me" : "default"} className={mine ? "" : "bg-[var(--v-paper)]"}>
                        <span className="sr-only">{author}: </span>
                        {m.text}
                      </BubbleContent>
                    </BubbleRow>
                    <BubbleTime className={mine ? "pe-1 ps-0" : "ps-1"}>
                      <span aria-hidden="true">{author} · </span>
                      <time dateTime={m.at}>{dateTime(m.at)}</time>
                    </BubbleTime>
                  </div>
                );
              })}
            </Bubble>
          </div>
          {open && (
            <form onSubmit={send} className="flex items-end gap-2">
              <Field className="flex-1">
                <FieldLabel className="sr-only">{t("neg.messageLabel")}</FieldLabel>
                <FieldControl>
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t("neg.messagePlaceholder")}
                    autoComplete="off"
                    disabled={blocked}
                  />
                </FieldControl>
              </Field>
              <Button type="submit" disabled={!text.trim() || blocked} aria-label={t("common.send")} className="min-h-11">
                <Icon name="send" size="sm" />
                <span className="hidden sm:inline">{t("common.send")}</span>
              </Button>
            </form>
          )}
        </Card>

        {/* Lote, finca revelada y propuesta */}
        <div className="grid content-start gap-6">
          <Card className="p-0">
            <Photo id={lot.image} className="aspect-[16/9] w-full" />
            <div className="grid gap-4 p-5">
              <div className="flex flex-wrap gap-2">
                <PriceModeBadge mode={lot.priceMode} />
              </div>
              <DataList
                items={[
                  { label: t("lot.available"), value: t("common.kg", { n: num(lot.quantityKg) }) },
                  { label: lot.priceMode === "fixed" ? t("common.price") : t("lot.referencePrice"), value: t("common.perKg", { price: eur(lot.pricePerKgEur) }) },
                  { label: t(`score.${lot.product}` as MessageKey), value: num(lot.score, 2) },
                  { label: t("common.process"), value: t(`process.${lot.process}` as MessageKey) },
                ]}
              />
              {farm && (
                <div className="rounded-[var(--r-card-sm)] bg-[var(--v-olive-soft)] p-4">
                  <h2 className="flex items-center gap-2 text-[length:var(--fs-control)] font-semibold text-[color:var(--rt-leaf)]">
                    <Icon name="eye" size="sm" /> {t("lot.farmRevealed")}
                  </h2>
                  <dl className="mt-3 grid gap-2 text-[length:var(--fs-control)]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-[color:var(--v-text-2)]">{t("common.farm")}</dt>
                      <dd className="text-right font-medium">{farm.name}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[color:var(--v-text-2)]">{t("common.municipality")}</dt>
                      <dd className="text-right font-medium">{farm.municipality}, Nariño</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[color:var(--v-text-2)]">{t("lot.altitude")}</dt>
                      <dd className="text-right font-medium">{t("lot.altitudeValue", { n: num(farm.altitudeM) })}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[color:var(--v-text-2)]">{t("lot.certificates")}</dt>
                      <dd className="text-right font-medium">
                        {certsOf(farm.id)
                          .filter((c) => c.status === "validated")
                          .map((c) => t(`cert.${c.type}` as MessageKey))
                          .join(", ")}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="rt-display mb-4 text-[length:var(--fs-title)] font-semibold">{t("neg.offer")}</h2>
            {open ? (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  saveOffer();
                }}
                className="grid gap-4"
              >
                <Field invalid={touched && priceError}>
                  <FieldLabel>{t("neg.offerPrice")}</FieldLabel>
                  <FieldControl>
                    <Input
                      inputMode="decimal"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={lot.priceMode === "fixed" || blocked}
                    />
                  </FieldControl>
                  {touched && priceError && <FieldError>{t("neg.priceError")}</FieldError>}
                </Field>
                <Field invalid={touched && Boolean(qtyError)}>
                  <FieldLabel>{t("neg.offerQty")}</FieldLabel>
                  <FieldControl>
                    <Input
                      inputMode="numeric"
                      value={qty}
                      onChange={(e) => {
                        setQty(e.target.value.replace(/[^\d]/g, ""));
                        setTouched(true);
                      }}
                      disabled={blocked}
                    />
                  </FieldControl>
                  {touched && qtyError && (
                    <FieldError>{t(`neg.qtyError.${qtyError}` as MessageKey, { n: num(lot.quantityKg) })}</FieldError>
                  )}
                </Field>
                {offerValid && <MoneySummary totals={totals} compact />}
                {blocked && (
                  <Notice variant="danger">
                    <AlertDescription>{t("lot.blockedBuyer")}</AlertDescription>
                  </Notice>
                )}
                <div className="flex flex-wrap gap-2">
                  {lot.priceMode === "negotiable" && (
                    <Button type="submit" variant="outline" disabled={blocked} className="min-h-11">
                      {t("neg.updateOffer")}
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={!offerValid || blocked} className="min-h-11">
                        <Icon name="lock" size="sm" /> {t("neg.agree")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("neg.agreeTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("neg.agreeWarning")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="grid gap-3">
                        <h3 className="text-[length:var(--fs-control)] font-semibold">{t("neg.summary")}</h3>
                        <DataList
                          items={[
                            { label: t("common.lot"), value: `${lot.code} · ${title}` },
                            { label: t("common.quantity"), value: t("common.kg", { n: num(qtyValue ?? 0) }) },
                            { label: t("common.price"), value: t("common.perKg", { price: eur(priceValue || 0) }) },
                          ]}
                        />
                        <MoneySummary totals={totals} compact />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                          <Button variant="outline">{t("common.cancel")}</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button onClick={agree}>{t("neg.agreeConfirm")}</Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </form>
            ) : (
              <DataList
                items={[
                  { label: t("common.quantity"), value: t("common.kg", { n: num(neg.offerQuantityKg) }) },
                  { label: t("common.price"), value: t("common.perKg", { price: eur(neg.offerPerKgEur ?? 0) }) },
                  { label: t("common.date"), value: date(neg.messages.at(-1)?.at ?? new Date().toISOString()) },
                ]}
              />
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

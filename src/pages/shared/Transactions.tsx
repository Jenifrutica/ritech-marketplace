import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox, CheckboxBody, CheckboxGroup } from "@/components/ui/checkbox";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Notice } from "@/components/common/Notice";
import { MilestonePath, type Milestone } from "@/components/ui/milestone-path";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BackLink } from "@/components/layout/AppLayout";
import { rolePath } from "@/components/layout/roleNav";
import { DataList, EmptyBlock, PageHeader, Photo, Section } from "@/components/common/Page";
import { EscrowBadge, ExampleBadge, StageBadge } from "@/components/common/StatusBadge";
import { useNotify } from "@/components/common/Notify";
import { MIN_COMMISSION_EUR, TX_FLOW, nextShippingStage, stageIndex, transactionTotals } from "@/domain/rules";
import type { Role, Transaction, TxStage } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";
import { useLookups, useStore } from "@/store/DemoStore";

type Totals = ReturnType<typeof transactionTotals>;

/** Desglose del dinero: valor, comisiones del 1% (con mínimo de ejemplo) y escrow. */
export function MoneySummary({ totals, compact = false }: { totals: Totals; compact?: boolean }) {
  const { t, eur, cop } = useI18n();
  const rows: [string, string, boolean?][] = [
    [t("tx.subtotal"), eur(totals.subtotal)],
    [t("tx.buyerFee"), eur(totals.buyerFee)],
    [t("tx.buyerPays"), eur(totals.buyerPays), true],
    [t("tx.sellerFee"), `− ${eur(totals.sellerFee)}`],
    [t("tx.sellerReceives"), eur(totals.sellerReceives), true],
  ];
  return (
    <div className={compact ? "grid gap-2" : "grid gap-3"}>
      <dl className="grid gap-1.5 text-[length:var(--fs-control)]">
        {rows.map(([label, value, strong]) => (
          <div
            key={label}
            className={
              strong
                ? "flex justify-between gap-3 border-t border-[var(--v-border)] pt-1.5 font-semibold"
                : "flex justify-between gap-3 text-[color:var(--v-text-2)]"
            }
          >
            <dt>{label}</dt>
            <dd className="tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="flex flex-wrap items-center gap-2 text-[length:var(--fs-meta)] text-[color:var(--v-text-3)]">
        <ExampleBadge />
        {t("tx.minFeeNote", { min: eur(MIN_COMMISSION_EUR) })}
      </p>
      {!compact && <p className="text-[length:var(--fs-meta)] text-[color:var(--v-text-3)]">{t("tx.copNote", { cop: cop(totals.buyerPays) })}</p>}
    </div>
  );
}

/** Lista de transacciones como tarjetas; se lee bien en cualquier ancho. */
export function TransactionCards({ txs, role }: { txs: Transaction[]; role: Role }) {
  const { t, eur, num, date } = useI18n();
  const { lot: findLot, user } = useLookups();
  return (
    <ul className="grid gap-3">
      {txs.map((tx) => {
        const lot = findLot(tx.lotId);
        if (!lot) return null;
        const counterpart = user(role === "buyer" ? tx.sellerId : tx.buyerId);
        return (
          <li key={tx.id}>
            <Link
              to={rolePath(role, `transactions/${tx.id}`)}
              className="rt-focus grid gap-3 rounded-[var(--r-card)] bg-[var(--v-paper)] p-4 text-inherit no-underline [box-shadow:inset_0_0_0_1px_var(--v-border)] hover:[box-shadow:inset_0_0_0_1px_var(--v-edge)] sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-center"
            >
              <Photo id={lot.image} decorative className="hidden h-20 rounded-[var(--r-card-sm)] sm:block" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{tx.code}</span>
                  <span className="text-[color:var(--v-text-2)]">
                    {t(`product.${lot.product}` as MessageKey)} {lot.variety} · {lot.code}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StageBadge stage={tx.stage} />
                  <EscrowBadge escrow={tx.escrow} />
                </div>
                <p className="mt-2 text-[length:var(--fs-small)] text-[color:var(--v-text-3)]">
                  {counterpart?.organization} · {date(tx.agreedAt)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:grid sm:justify-items-end sm:gap-1">
                <span className="rt-display text-[length:var(--fs-title)] font-semibold tabular-nums">{eur(tx.quantityKg * tx.pricePerKgEur)}</span>
                <span className="text-[length:var(--fs-small)] text-[color:var(--v-text-2)]">
                  {t("common.kg", { n: num(tx.quantityKg) })} × {eur(tx.pricePerKgEur)}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function TransactionList({ role }: { role: Extract<Role, "buyer" | "seller"> }) {
  const { t } = useI18n();
  const { state, me } = useStore();
  const txs = state.transactions.filter((tx) => (role === "buyer" ? tx.buyerId : tx.sellerId) === me?.id);
  return (
    <>
      <PageHeader
        title={role === "buyer" ? t("tx.purchasesTitle") : t("tx.salesTitle")}
        lead={role === "buyer" ? t("tx.purchasesLead") : t("tx.salesLead")}
      />
      {txs.length === 0 ? (
        <EmptyBlock title={t("tx.empty.title")} text={t("tx.empty.text")} />
      ) : (
        <TransactionCards txs={txs} role={role} />
      )}
    </>
  );
}

function useMilestones(tx: Transaction): Milestone[] {
  const { t, dateTime } = useI18n();
  const reached = (stage: TxStage) => tx.history.find((h) => h.stage === stage);
  const current = stageIndex(tx.stage);
  const flow: TxStage[] = [...TX_FLOW];
  if (tx.stage === "disputed" || tx.stage === "resolved") {
    flow.splice(flow.indexOf("accepted"), 1, "disputed", ...(tx.stage === "resolved" ? (["resolved"] as TxStage[]) : []));
  }
  return flow.map((stage) => {
    const hit = reached(stage);
    const i = stage === "disputed" || stage === "resolved" ? flow.indexOf(stage) : stageIndex(stage);
    const finished = tx.stage === "accepted" || tx.stage === "resolved";
    const state: Milestone["state"] =
      stage === tx.stage && !finished ? "current" : hit || i < current ? "complete" : "upcoming";
    return {
      id: stage,
      title: t(`stage.${stage}` as MessageKey),
      meta: hit ? <time dateTime={hit.at}>{dateTime(hit.at)}</time> : undefined,
      state,
    };
  });
}

export function TransactionDetail({ role }: { role: Role }) {
  const { id = "" } = useParams();
  const { t, eur, num, date, dateTime } = useI18n();
  const { state, me } = useStore();
  const { lot: findLot, farm: findFarm, user, dispute: findDispute } = useLookups();
  const tx = state.transactions.find((x) => x.id === id);
  const milestones = useMilestones(tx ?? (state.transactions[0] as Transaction));
  const back = {
    buyer: rolePath("buyer", "purchases"),
    seller: rolePath("seller", "sales"),
    owner: rolePath("owner", "samples"),
    carrier: rolePath("carrier"),
    admin: rolePath("admin", "disputes"),
    tech: rolePath("tech"),
  }[role];

  if (!tx) {
    return (
      <>
        <BackLink to={back} />
        <EmptyBlock title={t("notFound.title")} text={t("tx.notFound")} />
      </>
    );
  }
  const lot = findLot(tx.lotId)!;
  const farm = findFarm(lot.farmId);
  const totals = transactionTotals(tx);
  const dispute = tx.disputeId ? findDispute(tx.disputeId) : undefined;
  const statusLabels = {
    complete: t("milestone.complete"),
    current: t("milestone.current"),
    upcoming: t("milestone.upcoming"),
  };

  return (
    <>
      <BackLink to={back} />
      <PageHeader
        eyebrow={`${t(`product.${lot.product}` as MessageKey)} ${lot.variety} · ${lot.code}`}
        title={t("tx.title", { code: tx.code })}
        actions={
          <div className="flex flex-wrap gap-2">
            <StageBadge stage={tx.stage} />
            <EscrowBadge escrow={tx.escrow} />
          </div>
        }
      />

      {/* RN-6: la transacción acordada no se puede modificar */}
      <Notice icon="lock" variant="info" className="mb-6">
<AlertTitle>{t("tx.locked")}
        </AlertTitle>
        <AlertDescription>{t("tx.lockedText", { date: date(tx.agreedAt) })}</AlertDescription>
      </Notice>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid min-w-0 content-start gap-6">
          <RoleActions tx={tx} role={role} meId={me?.id} />
          <Card>
            <Section title={t("tx.tracker")} description={t("tx.trackerLead")}>
              <MilestonePath items={milestones} presentation="journey" statusLabels={statusLabels} />
            </Section>
          </Card>
          <Card>
            <Section title={t("tx.sample")}>
              {tx.sample ? (
                <DataList
                  items={[
                    { label: t("tx.sampleCode"), value: tx.sample.code },
                    { label: t("common.date"), value: dateTime(tx.sample.at) },
                    { label: t("tx.sampleNotes"), value: tx.sample.notes || "—" },
                  ]}
                />
              ) : (
                <p className="text-[color:var(--v-text-2)]">{t("tx.sampleNone")}</p>
              )}
            </Section>
          </Card>
          {tx.verification && (
            <Card>
              <Section title={t("tx.verify")} description={t("tx.verified", { date: dateTime(tx.verification.at) })}>
                <ul className="grid gap-2">
                  {Object.entries(tx.verification.checks).map(([key, ok]) => (
                    <li key={key} className="flex items-center gap-2">
                      <Icon name={ok ? "circle-check" : "x"} size="sm" className={ok ? "text-[color:var(--rt-leaf)]" : "text-[color:var(--v-danger-ink)]"} />
                      <span className="sr-only">{ok ? "✓" : "✗"}</span>
                      {t(`tx.check.${key}` as MessageKey)}
                    </li>
                  ))}
                </ul>
                {tx.verification.notes && <p className="mt-3 text-[color:var(--v-text-2)]">{tx.verification.notes}</p>}
                <p className="mt-3 font-semibold">{t(`tx.verdict.${tx.verification.verdict}` as MessageKey)}</p>
              </Section>
            </Card>
          )}
          {dispute && (
            <Notice icon="gavel" variant={dispute.status === "open" ? "danger" : "default"}>
<AlertTitle>{t("tx.dispute.status")} · {dispute.status === "open" ? t("stage.disputed") : t("admin.disputes.resolved")}
              </AlertTitle>
              <AlertDescription>
                <p>{dispute.reason}</p>
                {dispute.resolution && (
                  <p className="mt-2 font-semibold">
                    {dispute.resolution === "release" ? t("admin.disputes.resolutionRelease") : t("admin.disputes.resolutionRefund")}
                  </p>
                )}
              </AlertDescription>
            </Notice>
          )}
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <Section title={t("tx.money")}>
              <MoneySummary totals={totals} />
            </Section>
          </Card>
          <Card>
            <Section title={t("tx.parties")}>
              <DataList
                items={[
                  { label: t("common.buyer"), value: `${user(tx.buyerId)?.organization}` },
                  { label: t("common.seller"), value: `${user(tx.sellerId)?.organization}` },
                  { label: t("common.farm"), value: farm ? `${farm.name}, ${farm.municipality}` : "—" },
                  { label: t("common.carrier"), value: `${user(tx.carrierId)?.organization}` },
                  { label: t("common.quantity"), value: t("common.kg", { n: num(tx.quantityKg) }) },
                  { label: t("common.price"), value: t("common.perKg", { price: eur(tx.pricePerKgEur) }) },
                ]}
              />
            </Section>
          </Card>
        </div>
      </div>
    </>
  );
}

/** Acción principal según el rol y la etapa: una sola acción por pantalla. */
function RoleActions({ tx, role, meId }: { tx: Transaction; role: Role; meId?: string }) {
  const { t } = useI18n();
  const { farm: findFarm, lot: findLot } = useLookups();
  const lot = findLot(tx.lotId)!;
  const farm = findFarm(lot.farmId);

  if (role === "owner" && tx.stage === "agreed" && farm?.ownerId === meId) return <SampleForm tx={tx} />;
  if (role === "carrier" && tx.carrierId === meId) {
    if (tx.stage === "agreed") {
      return (
        <Notice icon="history" variant="warn">
<AlertTitle>{t("tx.waitSample")}
          </AlertTitle>
        </Notice>
      );
    }
    if (nextShippingStage(tx.stage)) return <AdvanceShipping tx={tx} />;
  }
  if (role === "buyer" && tx.buyerId === meId && tx.stage === "delivered") return <VerifyForm tx={tx} product={lot.product} />;
  if (role === "admin" && tx.stage === "disputed" && tx.disputeId) {
    return (
      <Notice variant="danger">
        <AlertTitle>{t("overview.pending.dispute", { code: tx.code })}</AlertTitle>
        <AlertDescription>
          <Link to={rolePath("admin", "disputes")} className="rt-link rt-focus font-medium">
            {t("nav.disputes")}
          </Link>
        </AlertDescription>
      </Notice>
    );
  }
  return null;
}

function SampleForm({ tx }: { tx: Transaction }) {
  const { t } = useI18n();
  const { dispatch } = useStore();
  const notify = useNotify();
  const [code, setCode] = React.useState(`M-${tx.code.split("-")[1]}`);
  const [notes, setNotes] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const invalid = !code.trim();
  return (
    <Card variant="featured">
      <Section title={t("tx.sampleRegister")} description={t("tx.sampleHint")}>
        <form
          noValidate
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (invalid) return;
            dispatch({ type: "registerSample", txId: tx.id, code: code.trim(), notes: notes.trim() });
            notify(t("tx.sampleRegistered"));
          }}
        >
          <Field invalid={touched && invalid}>
            <FieldLabel>{t("tx.sampleCode")}</FieldLabel>
            <FieldControl>
              <Input value={code} onChange={(e) => setCode(e.target.value)} required />
            </FieldControl>
          </Field>
          <Field>
            <FieldLabel>{t("tx.sampleNotes")}</FieldLabel>
            <FieldControl>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </FieldControl>
          </Field>
          <Button type="submit" className="min-h-11 w-fit">
            <Icon name="flask-conical" size="sm" /> {t("tx.sampleRegister")}
          </Button>
        </form>
      </Section>
    </Card>
  );
}

function AdvanceShipping({ tx }: { tx: Transaction }) {
  const { t } = useI18n();
  const { dispatch } = useStore();
  const notify = useNotify();
  const next = nextShippingStage(tx.stage)!;
  const label = t(`stage.${next}` as MessageKey);
  return (
    <Card variant="featured" className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span>{t("common.status")}:</span> <StageBadge stage={tx.stage} />
      </div>
      <Button
        className="min-h-11"
        onClick={() => {
          dispatch({ type: "advanceShipping", txId: tx.id });
          notify(t("tx.advanced", { stage: label }));
        }}
      >
        <Icon name="truck" size="sm" /> {t("tx.advance", { stage: label })}
      </Button>
    </Card>
  );
}

function VerifyForm({ tx, product }: { tx: Transaction; product: "coffee" | "cacao" }) {
  const { t, eur } = useI18n();
  const { dispatch } = useStore();
  const notify = useNotify();
  const keys = product === "coffee" ? ["humidity", "defects", "cup", "aroma"] : ["humidity", "defects", "cut", "aroma"];
  const [checks, setChecks] = React.useState<Record<string, boolean>>(Object.fromEntries(keys.map((k) => [k, false])));
  const [notes, setNotes] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [reasonTouched, setReasonTouched] = React.useState(false);
  const [disputeOpen, setDisputeOpen] = React.useState(false);
  const allOk = keys.every((k) => checks[k]);
  const totals = transactionTotals(tx);

  const submit = (verdict: "accept" | "reject") => {
    dispatch({
      type: "verify",
      txId: tx.id,
      verification: { checks, notes: notes.trim(), verdict, at: new Date().toISOString() },
      reason: reason.trim(),
    });
    notify(verdict === "accept" ? t("tx.accepted") : t("tx.disputeOpened"));
  };

  return (
    <Card variant="featured">
      <Section
        title={t("tx.verify")}
        description={t("tx.verifyLead")}
        actions={<ExampleBadge />}
      >
        <div className="grid gap-5">
          <fieldset className="grid gap-2">
            <legend className="sr-only">{t("tx.verify")}</legend>
            <CheckboxGroup>
              {keys.map((k) => (
                <Checkbox
                  key={k}
                  checked={checks[k]}
                  onCheckedChange={(v) => setChecks((c) => ({ ...c, [k]: v === true }))}
                  className="min-h-11"
                >
                  <CheckboxBody>{t(`tx.check.${k}` as MessageKey)}</CheckboxBody>
                </Checkbox>
              ))}
            </CheckboxGroup>
          </fieldset>
          <Field>
            <FieldLabel>{t("tx.verifyNotes")}</FieldLabel>
            <FieldControl>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </FieldControl>
          </Field>
          {!allOk && <p className="text-[length:var(--fs-small)] text-[color:var(--v-text-2)]">{t("tx.checksIncomplete")}</p>}
          <div className="flex flex-wrap gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!allOk} className="min-h-11">
                  <Icon name="banknote" size="sm" /> {t("tx.accept")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("tx.acceptTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("tx.acceptText", { amount: eur(totals.sellerReceives) })}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button variant="outline">{t("common.cancel")}</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button onClick={() => submit("accept")}>{t("tx.accept")}</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="min-h-11">
                  <Icon name="triangle-alert" size="sm" /> {t("tx.dispute")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form
                  noValidate
                  className="grid gap-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setReasonTouched(true);
                    if (!reason.trim()) return;
                    setDisputeOpen(false);
                    submit("reject");
                  }}
                >
                  <DialogHeader>
                    <DialogTitle>{t("tx.dispute")}</DialogTitle>
                    <DialogDescription>{t("tx.disputeReasonHint")}</DialogDescription>
                  </DialogHeader>
                  <Field invalid={reasonTouched && !reason.trim()}>
                    <FieldLabel>{t("tx.disputeReason")}</FieldLabel>
                    <FieldControl>
                      <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} required />
                    </FieldControl>
                    {reasonTouched && !reason.trim() ? (
                      <FieldError>{t("tx.disputeReasonError")}</FieldError>
                    ) : (
                      <FieldDescription>{t("admin.disputes.resolveText")}</FieldDescription>
                    )}
                  </Field>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDisputeOpen(false)}>
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit" variant="danger">
                      {t("tx.dispute")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Section>
    </Card>
  );
}

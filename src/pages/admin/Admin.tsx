import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";
import { ActivityFeed } from "@/components/ui/activity-feed";
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
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { rolePath } from "@/components/layout/roleNav";
import { DataList, EmptyBlock, Kpi, PageHeader, PendingList, Section, type PendingItem } from "@/components/common/Page";
import { CertStatusBadge, EscrowBadge, ExampleBadge, StageBadge, UserStatusBadge, VerifiedBadge } from "@/components/common/StatusBadge";
import { useNotify } from "@/components/common/Notify";
import { COMMISSION_RATE, MIN_COMMISSION_EUR, transactionTotals } from "@/domain/rules";
import { ROLES, type Role, type User } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";
import { useLookups, useStore } from "@/store/DemoStore";

function ConfirmButton({
  label,
  title,
  description,
  onConfirm,
  variant = "outline",
  icon,
  confirmVariant = "default",
}: {
  label: string;
  title: string;
  description: string;
  onConfirm: () => void;
  variant?: "outline" | "default" | "danger";
  icon?: string;
  confirmVariant?: "default" | "danger";
}) {
  const { t } = useI18n();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size="sm" className="min-h-11">
          {icon && <Icon name={icon} size="sm" />} {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">{t("common.cancel")}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={confirmVariant} onClick={onConfirm}>
              {label}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AdminOverview() {
  const { t, eur, dateTime } = useI18n();
  const { state, me } = useStore();
  const { user, tx: findTx } = useLookups();
  const openDisputes = state.disputes.filter((d) => d.status === "open");
  const pendingCerts = state.certificates.filter((c) => c.status === "pending");
  const unverified = state.users.filter((u) => !u.verified && u.status === "active");
  const collected = state.transactions.filter((tx) => tx.escrow === "released").reduce((s, tx) => s + transactionTotals(tx).platformRevenue, 0);

  const pending: PendingItem[] = [
    ...openDisputes.map((d) => ({ id: d.id, label: t("overview.pending.dispute", { code: findTx(d.transactionId)?.code ?? "" }), to: rolePath("admin", "disputes"), icon: "gavel" })),
    ...pendingCerts.map((c) => ({ id: c.id, label: t("overview.pending.cert", { file: c.fileName }), to: rolePath("admin", "certificates"), icon: "file-check" })),
    ...unverified.map((u) => ({ id: u.id, label: t("overview.pending.newUser", { org: u.organization }), to: rolePath("admin", "users"), icon: "user" })),
  ];

  return (
    <>
      <PageHeader title={t("overview.greeting", { name: me?.name.split(" ")[0] ?? "" })} lead={t("role.admin.desc")} />
      <div className="grid gap-8">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <li><Kpi label={t("overview.kpi.users")} value={state.users.filter((u) => u.status === "active").length} icon="users" /></li>
          <li><Kpi label={t("overview.kpi.disputes")} value={openDisputes.length} icon="gavel" /></li>
          <li><Kpi label={t("certStatus.pending")} value={pendingCerts.length} icon="file-check" /></li>
          <li><Kpi label={t("overview.kpi.revenue")} value={eur(collected)} icon="hand-coins" /></li>
        </ul>
        <div className="grid gap-8 xl:grid-cols-2">
          <PendingList items={pending} />
          <ActivityFeed
              title={t("overview.recent")}
              initialVisible={5}
              pageSize={5}
              showMoreLabel={t("common.showMore")}
              countLabel={(shown, total) => t("feed.count", { shown, total })}
              entries={state.audit.slice(0, 15).map((a) => {
                const u = user(a.userId);
                return {
                  id: a.id,
                  title: `${t(`action.${a.action}` as MessageKey)} · ${a.target}`,
                  actor: u ? { name: u.name, initials: u.name.split(" ").map((p) => p[0]).join("").slice(0, 2) } : undefined,
                  timestamp: dateTime(a.at),
                  dateTime: a.at,
                };
              })}
            />
        </div>
      </div>
    </>
  );
}

export function AdminUsers() {
  const { t, date } = useI18n();
  const { state, dispatch } = useStore();
  const notify = useNotify();
  const [role, setRole] = React.useState<Role | "all">("all");
  const users = state.users.filter((u) => role === "all" || u.role === role).filter((u) => u.role !== "admin" && u.role !== "tech");

  const actions = (u: User) => (
    <div className="flex flex-wrap gap-2">
      {!u.verified && (
        <Button
          variant="outline"
          size="sm"
          className="min-h-11"
          onClick={() => {
            dispatch({ type: "verifyUser", userId: u.id });
            notify(t("admin.users.verified", { name: u.name }));
          }}
        >
          <Icon name="shield-check" size="sm" /> {t("admin.users.verify")}
        </Button>
      )}
      {u.status === "active" ? (
        <ConfirmButton
          label={t("admin.users.block")}
          icon="ban"
          title={t("admin.users.blockTitle", { name: u.name })}
          description={t("admin.users.blockText")}
          confirmVariant="danger"
          onConfirm={() => {
            dispatch({ type: "setUserStatus", userId: u.id, status: "blocked" });
            notify(t("admin.users.blocked", { name: u.name }), "danger");
          }}
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="min-h-11"
          onClick={() => {
            dispatch({ type: "setUserStatus", userId: u.id, status: "active" });
            notify(t("admin.users.unblocked", { name: u.name }));
          }}
        >
          <Icon name="circle-check" size="sm" /> {t("admin.users.unblock")}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <PageHeader title={t("admin.users.title")} lead={t("admin.users.lead")} />
      <div className="mb-6 max-w-xs">
        <Field>
          <FieldLabel>{t("admin.users.filter")}</FieldLabel>
          <FieldControl>
            <NativeSelect value={role} onChange={(e) => setRole(e.target.value as Role | "all")}>
              <NativeSelectOption value="all">{t("common.all")}</NativeSelectOption>
              {ROLES.filter((r) => r !== "admin" && r !== "tech").map((r) => (
                <NativeSelectOption key={r} value={r}>
                  {t(`role.${r}` as MessageKey)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FieldControl>
        </Field>
      </div>

      {/* Tabla en pantallas medianas y grandes */}
      <div className="hidden md:block">
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.user")}</TableHead>
                <TableHead>{t("admin.users.org")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-[length:var(--fs-meta)] text-[color:var(--v-text-3)]">
                      {t(`role.${u.role}` as MessageKey)} · {date(u.joinedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{u.organization}</div>
                    <div className="text-[length:var(--fs-meta)] text-[color:var(--v-text-3)]">
                      {u.city}, {u.country}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      <UserStatusBadge status={u.status} />
                      <VerifiedBadge verified={u.verified} />
                    </div>
                  </TableCell>
                  <TableCell>{actions(u)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Tarjetas en móvil */}
      <ul className="grid gap-3 md:hidden">
        {users.map((u) => (
          <li key={u.id}>
            <Card size="sm" className="grid gap-3">
              <div>
                <div className="font-semibold">{u.name}</div>
                <div className="text-[length:var(--fs-small)] text-[color:var(--v-text-2)]">
                  {t(`role.${u.role}` as MessageKey)} · {u.organization} · {u.country}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <UserStatusBadge status={u.status} />
                <VerifiedBadge verified={u.verified} />
              </div>
              {actions(u)}
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}

export function AdminCertificates() {
  const { t, date } = useI18n();
  const { state, dispatch } = useStore();
  const { farm: findFarm, user } = useLookups();
  const notify = useNotify();
  const sorted = [...state.certificates].sort((a, b) => (a.status === "pending" ? -1 : 0) - (b.status === "pending" ? -1 : 0));
  return (
    <>
      <PageHeader title={t("admin.certs.title")} lead={t("admin.certs.lead")} />
      <ul className="grid gap-3">
        {sorted.map((c) => {
          const farm = findFarm(c.farmId);
          return (
            <li key={c.id}>
              <Card size="sm" className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon name="file-text" size="sm" />
                    <span className="font-semibold">{c.fileName}</span>
                    <CertStatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 text-[length:var(--fs-small)] text-[color:var(--v-text-2)]">
                    {t(`cert.${c.type}` as MessageKey)} · {farm?.name} ({farm?.municipality}) · {user(farm?.ownerId ?? "")?.name}
                  </p>
                  <p className="text-[length:var(--fs-meta)] text-[color:var(--v-text-3)]">
                    {t("certs.validUntil")}: {date(c.validUntil)} · {t("certs.issuedBy")}: {c.issuedBy}
                  </p>
                </div>
                {c.status === "pending" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="min-h-11"
                      onClick={() => {
                        dispatch({ type: "reviewCertificate", certId: c.id, status: "validated" });
                        notify(t("admin.certs.validated"));
                      }}
                    >
                      <Icon name="check" size="sm" /> {t("admin.certs.validate")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-11"
                      onClick={() => {
                        dispatch({ type: "reviewCertificate", certId: c.id, status: "rejected" });
                        notify(t("admin.certs.rejected"), "danger");
                      }}
                    >
                      <Icon name="x" size="sm" /> {t("admin.certs.reject")}
                    </Button>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function AdminDisputes() {
  const { t, eur, date } = useI18n();
  const { state, dispatch } = useStore();
  const { tx: findTx, lot: findLot, user } = useLookups();
  const notify = useNotify();
  return (
    <>
      <PageHeader title={t("admin.disputes.title")} lead={t("admin.disputes.lead")} />
      {state.disputes.length === 0 ? (
        <EmptyBlock title={t("admin.disputes.empty.title")} text={t("admin.disputes.empty.text")} />
      ) : (
        <ul className="grid gap-4">
          {state.disputes.map((d) => {
            const tx = findTx(d.transactionId);
            if (!tx) return null;
            const lot = findLot(tx.lotId)!;
            const totals = transactionTotals(tx);
            return (
              <li key={d.id}>
                <Card className="grid gap-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="rt-display text-[length:var(--fs-title)] font-semibold">
                        <Link to={rolePath("admin", `transactions/${tx.id}`)} className="rt-link rt-focus">
                          {tx.code}
                        </Link>{" "}
                        · {t(`product.${lot.product}` as MessageKey)} {lot.variety}
                      </h2>
                      <p className="text-[length:var(--fs-small)] text-[color:var(--v-text-2)]">{t("admin.disputes.opened", { date: date(d.openedAt) })}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StageBadge stage={tx.stage} />
                      <EscrowBadge escrow={tx.escrow} />
                    </div>
                  </div>
                  <DataList
                    items={[
                      { label: t("common.buyer"), value: user(tx.buyerId)?.organization },
                      { label: t("common.seller"), value: user(tx.sellerId)?.organization },
                      { label: t("tx.buyerPays"), value: eur(totals.buyerPays) },
                      { label: t("tx.sellerReceives"), value: eur(totals.sellerReceives) },
                    ]}
                  />
                  <div className="rounded-[var(--r-card-sm)] bg-[var(--status-danger-bg)] p-4">
                    <h3 className="text-[length:var(--fs-control)] font-semibold text-[color:var(--status-danger-ink)]">{t("admin.disputes.evidence")}</h3>
                    <p className="mt-1">{d.reason}</p>
                    {tx.verification?.notes && <p className="mt-1 text-[color:var(--v-text-2)]">{tx.verification.notes}</p>}
                  </div>
                  {d.status === "open" ? (
                    <div className="flex flex-wrap gap-2">
                      <ConfirmButton
                        label={t("admin.disputes.release")}
                        icon="banknote"
                        variant="default"
                        title={t("admin.disputes.resolveTitle")}
                        description={`${t("admin.disputes.resolutionRelease")} (${eur(totals.sellerReceives)}). ${t("admin.disputes.resolveText")}`}
                        onConfirm={() => {
                          dispatch({ type: "resolveDispute", disputeId: d.id, resolution: "release" });
                          notify(t("admin.disputes.resolved"));
                        }}
                      />
                      <ConfirmButton
                        label={t("admin.disputes.refund")}
                        icon="wallet"
                        title={t("admin.disputes.resolveTitle")}
                        description={`${t("admin.disputes.resolutionRefund")} (${eur(totals.buyerPays)}). ${t("admin.disputes.resolveText")}`}
                        onConfirm={() => {
                          dispatch({ type: "resolveDispute", disputeId: d.id, resolution: "refund" });
                          notify(t("admin.disputes.resolved"));
                        }}
                      />
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 font-semibold">
                      <Icon name="gavel" size="sm" />
                      {d.resolution === "release" ? t("admin.disputes.resolutionRelease") : t("admin.disputes.resolutionRefund")}
                    </p>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export function AdminCommissions() {
  const { t, eur, num } = useI18n();
  const { state } = useStore();
  const { user } = useLookups();
  const collected = state.transactions.filter((tx) => tx.escrow === "released").reduce((s, tx) => s + transactionTotals(tx).platformRevenue, 0);
  const projected = state.transactions.filter((tx) => tx.escrow === "held").reduce((s, tx) => s + transactionTotals(tx).platformRevenue, 0);
  return (
    <>
      <PageHeader title={t("admin.commissions.title")} lead={t("admin.commissions.lead")} />
      <div className="grid gap-8">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <li><Kpi label={t("admin.commissions.rate")} value={`${num(COMMISSION_RATE * 100)}%`} icon="scale" /></li>
          <li><Kpi label={t("admin.commissions.min")} value={eur(MIN_COMMISSION_EUR)} icon="hand-coins" note={<ExampleBadge />} /></li>
          <li><Kpi label={t("admin.commissions.collected")} value={eur(collected)} icon="banknote" /></li>
          <li><Kpi label={t("admin.commissions.projected")} value={eur(projected)} icon="lock-keyhole" /></li>
        </ul>
        <p className="text-[length:var(--fs-small)] text-[color:var(--v-text-2)]">{t("admin.commissions.minNote")}</p>
        <Section title={t("admin.commissions.byTx")}>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.lot")}</TableHead>
                  <TableHead>{t("tx.parties")}</TableHead>
                  <TableHead className="text-right">{t("tx.subtotal")}</TableHead>
                  <TableHead className="text-right">{t("tx.buyerFee")}</TableHead>
                  <TableHead className="text-right">{t("tx.sellerFee")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.transactions.map((tx) => {
                  const totals = transactionTotals(tx);
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        <Link to={rolePath("admin", `transactions/${tx.id}`)} className="rt-link rt-focus">
                          {tx.code}
                        </Link>
                      </TableCell>
                      <TableCell className="min-w-[180px] text-[length:var(--fs-small)]">
                        {user(tx.buyerId)?.organization}
                        <br />
                        <span className="text-[color:var(--v-text-3)]">{user(tx.sellerId)?.organization}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{eur(totals.subtotal)}</TableCell>
                      <TableCell className="text-right tabular-nums">{eur(totals.buyerFee)}</TableCell>
                      <TableCell className="text-right tabular-nums">{eur(totals.sellerFee)}</TableCell>
                      <TableCell>
                        <EscrowBadge escrow={tx.escrow} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Section>
      </div>
    </>
  );
}

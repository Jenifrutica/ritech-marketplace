import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataList, PageHeader, Section } from "@/components/common/Page";
import { useNotify } from "@/components/common/Notify";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";
import { useLookups, useStore } from "@/store/DemoStore";

const services: { key: MessageKey; status: "ok" | "degraded"; latency: number; icon: string }[] = [
  { key: "tech.service.frontend", status: "ok", latency: 38, icon: "globe" },
  { key: "tech.service.backend", status: "ok", latency: 142, icon: "server" },
  { key: "tech.service.db", status: "ok", latency: 9, icon: "database" },
  { key: "tech.service.logs", status: "degraded", latency: 410, icon: "activity" },
];

export function TechOverview() {
  const { t, dateTime } = useI18n();
  const { state, dispatch } = useStore();
  const notify = useNotify();
  const [running, setRunning] = React.useState(false);
  const next = new Date(new Date(state.lastBackupAt).getTime() + 24 * 3600 * 1000).toISOString();

  return (
    <>
      <PageHeader title={t("tech.title")} lead={t("tech.lead")} />
      <div className="grid gap-8 xl:grid-cols-2">
        <Card>
          <Section title={t("tech.services")}>
            <ul className="grid gap-3">
              {services.map((s) => (
                <li key={s.key} className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--r-card-sm)] bg-[var(--v-beige-2)] p-3">
                  <span className="flex items-center gap-3">
                    <Icon name={s.icon} size="sm" />
                    <span className="font-medium">{t(s.key)}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-[length:var(--fs-small)] tabular-nums text-[color:var(--v-text-2)]">
                      {t("tech.latency")}: {s.latency} ms
                    </span>
                    <Badge variant={s.status === "ok" ? "olive" : "yellow"} className="gap-1.5">
                      <Icon name={s.status === "ok" ? "circle-check" : "triangle-alert"} size="sm" />
                      {s.status === "ok" ? t("tech.service.ok") : t("tech.service.degraded")}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </Card>
        <Card>
          <Section title={t("tech.backups")}>
            <div className="grid gap-5">
              <DataList
                items={[
                  { label: t("tech.backupLast"), value: dateTime(state.lastBackupAt) },
                  { label: t("tech.backupNext"), value: dateTime(next) },
                  { label: t("tech.backupRetention"), value: t("tech.backupRetentionValue") },
                  { label: "RDS", value: "rds-ritech-prod (PostgreSQL + PostGIS)" },
                ]}
              />
              <Button
                className="min-h-11 w-fit"
                loading={running}
                onClick={() => {
                  setRunning(true);
                  window.setTimeout(() => {
                    dispatch({ type: "runBackup" });
                    setRunning(false);
                    notify(t("tech.backupDone"));
                  }, 900);
                }}
              >
                <Icon name="database" size="sm" /> {t("tech.backupRun")}
              </Button>
            </div>
          </Section>
        </Card>
      </div>
    </>
  );
}

export function TechAudit() {
  const { t, dateTime } = useI18n();
  const { state } = useStore();
  const { user } = useLookups();
  const [action, setAction] = React.useState("all");
  const actions = Array.from(new Set(state.audit.map((a) => a.action)));
  const rows = state.audit.filter((a) => action === "all" || a.action === action);
  return (
    <>
      <PageHeader title={t("tech.audit")} lead={t("tech.lead")} />
      <div className="mb-6 max-w-xs">
        <Field>
          <FieldLabel>{t("tech.auditFilter")}</FieldLabel>
          <FieldControl>
            <NativeSelect value={action} onChange={(e) => setAction(e.target.value)}>
              <NativeSelectOption value="all">{t("common.all")}</NativeSelectOption>
              {actions.map((a) => (
                <NativeSelectOption key={a} value={a}>
                  {t(`action.${a}` as MessageKey)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FieldControl>
        </Field>
      </div>
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.date")}</TableHead>
              <TableHead>{t("common.user")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
              <TableHead>{t("common.lot")} / ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a) => {
              const u = user(a.userId);
              return (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap tabular-nums">
                    <time dateTime={a.at}>{dateTime(a.at)}</time>
                  </TableCell>
                  <TableCell className="min-w-[160px]">
                    <div className="font-medium">{u?.name}</div>
                    <div className="text-[length:var(--fs-meta)] text-[color:var(--v-text-3)]">{u && t(`role.${u.role}` as MessageKey)}</div>
                  </TableCell>
                  <TableCell>{t(`action.${a.action}` as MessageKey)}</TableCell>
                  <TableCell className="font-mono text-[length:var(--fs-small)]">{a.target}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

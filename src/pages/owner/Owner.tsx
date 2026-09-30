import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Checkbox, CheckboxBody } from "@/components/ui/checkbox";
import { Dropzone } from "@/components/ui/dropzone";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { AlertDescription } from "@/components/ui/alert";
import { Notice } from "@/components/common/Notice";
import { Stepper, StepperIndicator, StepperItem, StepperList, StepperTitle } from "@/components/ui/stepper";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { rolePath } from "@/components/layout/roleNav";
import { DataList, EmptyBlock, Kpi, PageHeader, PendingList, Photo, Section, type PendingItem } from "@/components/common/Page";
import { CertStatusBadge, EudrBadge, StageBadge } from "@/components/common/StatusBadge";
import { useNotify } from "@/components/common/Notify";
import type { CertificateType, Product } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";
import { useLookups, useStore } from "@/store/DemoStore";

function useOwnerData() {
  const { state, me } = useStore();
  const farms = state.farms.filter((f) => f.ownerId === me?.id);
  const farmIds = new Set(farms.map((f) => f.id));
  const lotIds = new Set(state.lots.filter((l) => farmIds.has(l.farmId)).map((l) => l.id));
  const txs = state.transactions.filter((tx) => lotIds.has(tx.lotId));
  const certs = state.certificates.filter((c) => farmIds.has(c.farmId));
  return { farms, txs, certs };
}

export function OwnerOverview() {
  const { t } = useI18n();
  const { me } = useStore();
  const { farms, txs, certs } = useOwnerData();
  const pending: PendingItem[] = [
    ...txs
      .filter((tx) => tx.stage === "agreed")
      .map((tx) => ({ id: tx.id, label: t("overview.pending.sample", { code: tx.code }), to: rolePath("owner", `transactions/${tx.id}`), icon: "flask-conical" })),
    ...farms
      .filter((f) => f.eudr !== "enabled")
      .map((f) => ({ id: f.id, label: t("overview.pending.eudr", { farm: f.name }), to: rolePath("owner", "certificates"), icon: "file-check" })),
  ];
  return (
    <>
      <PageHeader
        title={t("overview.greeting", { name: me?.name.split(" ")[0] ?? "" })}
        lead={`${me?.organization} · ${me?.city}, Nariño`}
        actions={
          <Button asChild className="min-h-11">
            <Link to={rolePath("owner", "farms/new")}>
              <Icon name="map-pin" size="sm" /> {t("nav.registerFarm")}
            </Link>
          </Button>
        }
      />
      <div className="grid gap-8">
        <ul className="grid gap-4 sm:grid-cols-3">
          <li><Kpi label={t("overview.kpi.farms")} value={farms.length} icon="trees" /></li>
          <li><Kpi label={t("overview.kpi.certs")} value={certs.filter((c) => c.status === "validated").length} icon="file-check" /></li>
          <li><Kpi label={t("nav.samples")} value={txs.filter((tx) => tx.stage === "agreed").length} icon="flask-conical" /></li>
        </ul>
        <PendingList items={pending} />
        <FarmGrid />
      </div>
    </>
  );
}

function FarmGrid() {
  const { t, num } = useI18n();
  const { certsOf } = useLookups();
  const { farms } = useOwnerData();
  return (
    <Section title={t("farms.title")} description={t("farms.eudrHelp")}>
      <ul className="grid gap-5 md:grid-cols-2">
        {farms.map((farm) => {
          const certs = certsOf(farm.id);
          const hasDeforestation = certs.some((c) => c.type === "deforestation" && c.status === "validated");
          return (
            <li key={farm.id}>
              <Card className="h-full p-0">
                <Photo id={farm.image} className="aspect-[16/9] w-full" credit />
                <div className="grid gap-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="rt-display text-[length:var(--fs-title)] font-semibold">{farm.name}</h3>
                      <p className="text-[color:var(--v-text-2)]">{farm.municipality}, Nariño</p>
                    </div>
                    <EudrBadge status={farm.eudr} />
                  </div>
                  <DataList
                    items={[
                      { label: t("lot.altitude"), value: t("lot.altitudeValue", { n: num(farm.altitudeM) }) },
                      { label: t("farms.area"), value: t("farms.areaValue", { n: num(farm.areaHa, 1) }) },
                      { label: t("common.product"), value: farm.products.map((p) => t(`product.${p}` as MessageKey)).join(", ") },
                      { label: t("common.variety"), value: farm.varieties.join(", ") },
                    ]}
                  />
                  <ul className="flex flex-wrap gap-2" aria-label={t("lot.certificates")}>
                    {certs.map((c) => (
                      <li key={c.id} className="flex items-center gap-1.5 rounded-full bg-[var(--v-beige-2)] px-3 py-1 text-[length:var(--fs-small)]">
                        {t(`cert.${c.type}` as MessageKey)}: <CertStatusBadge status={c.status} />
                      </li>
                    ))}
                  </ul>
                  {!hasDeforestation && (
                    <Notice variant="warn">
                      <AlertDescription className="flex flex-wrap items-center gap-2">
                        {t("farms.missingDeforestation")}
                        <Link to={rolePath("owner", "certificates")} className="rt-link rt-focus font-medium">
                          {t("certs.upload")}
                        </Link>
                      </AlertDescription>
                    </Notice>
                  )}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

export function Farms() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader
        title={t("farms.title")}
        lead={t("farms.lead")}
        actions={
          <Button asChild className="min-h-11">
            <Link to={rolePath("owner", "farms/new")}>
              <Icon name="plus" size="sm" /> {t("nav.registerFarm")}
            </Link>
          </Button>
        }
      />
      <FarmGrid />
    </>
  );
}

const MUNICIPALITIES = ["Albán", "Buesaco", "Chachagüí", "Consacá", "El Tablón de Gómez", "La Unión", "Pasto", "Samaniego", "San Lorenzo", "Sandoná", "Tumaco", "Yacuanquer"];

export function RegisterFarm() {
  const { t } = useI18n();
  const { dispatch, me, newId } = useStore();
  const notify = useNotify();
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState("");
  const [municipality, setMunicipality] = React.useState("La Unión");
  const [altitude, setAltitude] = React.useState("1800");
  const [area, setArea] = React.useState("");
  const [products, setProducts] = React.useState<Product[]>(["coffee"]);
  const [varieties, setVarieties] = React.useState("Caturra, Castillo");
  const [vertices, setVertices] = React.useState<[string, string][]>([
    ["1.6021", "-77.1312"],
    ["1.6034", "-77.1288"],
    ["1.6012", "-77.1271"],
  ]);
  const [tried, setTried] = React.useState<Record<number, boolean>>({});
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const num = (v: string) => Number(v.replace(",", "."));
  const errors1 = {
    name: !name.trim(),
    altitude: !(num(altitude) > 0),
    area: !(num(area) > 0),
    products: products.length === 0,
  };
  const step1Valid = !Object.values(errors1).some(Boolean);
  const validVertices = vertices.filter(([la, ln]) => Math.abs(num(la)) <= 90 && Math.abs(num(ln)) <= 180 && la.trim() !== "" && ln.trim() !== "" && !Number.isNaN(num(la)) && !Number.isNaN(num(ln)));
  const step2Valid = validVertices.length >= 3 && validVertices.length === vertices.length;
  const labels = [t("farms.register.step1"), t("farms.register.step2"), t("farms.register.step3")];

  const go = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  };
  const next = () => {
    setTried((s) => ({ ...s, [step]: true }));
    if (step === 1 && !step1Valid) return;
    if (step === 2 && !step2Valid) return;
    go(step + 1);
  };
  const submit = () => {
    if (!me) return;
    dispatch({
      type: "registerFarm",
      id: newId("f"),
      farm: {
        ownerId: me.id,
        sellerId: "u-seller",
        name: name.trim(),
        municipality,
        altitudeM: num(altitude),
        areaHa: num(area),
        products,
        varieties: varieties.split(",").map((v) => v.trim()).filter(Boolean),
        polygon: vertices.map(([la, ln]) => [num(la), num(ln)]),
      },
    });
    notify(t("farms.register.done"));
    navigate(rolePath("owner", "certificates"));
  };

  return (
    <>
      <PageHeader title={t("farms.register.title")} lead={t("farms.register.lead")} />
      <Card className="grid gap-8">
        <Stepper value={step} count={3} labels={labels}>
          <StepperList orientation="horizontal" aria-label={t("farms.register.title")} className="grid-cols-3">
            {labels.map((label, i) => (
              <StepperItem key={label} step={i + 1}>
                <StepperIndicator step={i + 1} />
                <StepperTitle className="text-[length:var(--fs-small)] sm:text-[length:var(--fs-body)]">{label}</StepperTitle>
              </StepperItem>
            ))}
          </StepperList>
        </Stepper>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 3) next();
            else submit();
          }}
          className="grid gap-6"
        >
          <h2 ref={headingRef} tabIndex={-1} className="rt-display text-[length:var(--fs-title)] font-semibold outline-none">
            {labels[step - 1]}
          </h2>

          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Field invalid={tried[1] && errors1.name} className="md:col-span-2">
                <FieldLabel>{t("farms.register.name")}</FieldLabel>
                <FieldControl>
                  <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" required />
                </FieldControl>
                {tried[1] && errors1.name && <FieldError>{t("farms.register.nameError")}</FieldError>}
              </Field>
              <Field>
                <FieldLabel>{t("farms.register.municipality")}</FieldLabel>
                <FieldControl>
                  <NativeSelect value={municipality} onChange={(e) => setMunicipality(e.target.value)}>
                    {MUNICIPALITIES.map((m) => (
                      <NativeSelectOption key={m} value={m}>
                        {m}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </FieldControl>
              </Field>
              <Field invalid={tried[1] && errors1.altitude}>
                <FieldLabel>{t("farms.register.altitude")}</FieldLabel>
                <FieldControl>
                  <Input inputMode="numeric" value={altitude} onChange={(e) => setAltitude(e.target.value.replace(/[^\d]/g, ""))} required />
                </FieldControl>
                {tried[1] && errors1.altitude && <FieldError>{t("farms.register.numberError")}</FieldError>}
              </Field>
              <Field invalid={tried[1] && errors1.area}>
                <FieldLabel>{t("farms.register.area")}</FieldLabel>
                <FieldControl>
                  <Input inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value.replace(/[^\d.,]/g, ""))} required />
                </FieldControl>
                {tried[1] && errors1.area && <FieldError>{t("farms.register.numberError")}</FieldError>}
              </Field>
              <Field>
                <FieldLabel>{t("farms.register.varieties")}</FieldLabel>
                <FieldControl>
                  <Input value={varieties} onChange={(e) => setVarieties(e.target.value)} />
                </FieldControl>
              </Field>
              <FieldSet className="md:col-span-2">
                <FieldLegend className="text-[length:var(--fs-control)]">{t("farms.register.products")}</FieldLegend>
                <div className="flex flex-wrap gap-4">
                  {(["coffee", "cacao"] as const).map((p) => (
                    <Checkbox
                      key={p}
                      checked={products.includes(p)}
                      onCheckedChange={(v) => setProducts((cur) => (v === true ? [...cur, p] : cur.filter((x) => x !== p)))}
                      className="min-h-11"
                    >
                      <CheckboxBody>{t(`product.${p}` as MessageKey)}</CheckboxBody>
                    </Checkbox>
                  ))}
                </div>
                {tried[1] && errors1.products && <p role="alert" className="text-[length:var(--fs-meta)] text-[color:var(--v-danger-ink)]">{t("farms.register.productError")}</p>}
              </FieldSet>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <p className="text-[color:var(--v-text-2)]">{t("farms.register.polygonLead")}</p>
              <ol className="grid gap-3">
                {vertices.map(([la, ln], i) => (
                  <li key={i} className="grid items-end gap-3 rounded-[var(--r-card-sm)] bg-[var(--v-beige-2)] p-3 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <span className="font-semibold sm:pb-3">{t("farms.register.vertex", { n: i + 1 })}</span>
                    <Field>
                      <FieldLabel>{t("farms.register.lat")}</FieldLabel>
                      <FieldControl>
                        <Input inputMode="decimal" value={la} onChange={(e) => setVertices((v) => v.map((p, j) => (j === i ? [e.target.value, p[1]] : p)))} />
                      </FieldControl>
                    </Field>
                    <Field>
                      <FieldLabel>{t("farms.register.lng")}</FieldLabel>
                      <FieldControl>
                        <Input inputMode="decimal" value={ln} onChange={(e) => setVertices((v) => v.map((p, j) => (j === i ? [p[0], e.target.value] : p)))} />
                      </FieldControl>
                    </Field>
                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-11"
                      disabled={vertices.length <= 3}
                      aria-label={t("farms.register.removeVertex", { n: i + 1 })}
                      onClick={() => setVertices((v) => v.filter((_, j) => j !== i))}
                    >
                      <Icon name="x" size="sm" />
                    </Button>
                  </li>
                ))}
              </ol>
              <Button type="button" variant="outline" className="min-h-11 w-fit" onClick={() => setVertices((v) => [...v, ["", ""]])}>
                <Icon name="plus" size="sm" /> {t("farms.register.addVertex")}
              </Button>
              {tried[2] && !step2Valid && (
                <p role="alert" className="text-[length:var(--fs-small)] text-[color:var(--v-danger-ink)]">
                  {t("farms.register.polygonError")}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              <p className="text-[color:var(--v-text-2)]">{t("farms.register.review")}</p>
              <DataList
                items={[
                  { label: t("farms.register.name"), value: name },
                  { label: t("farms.register.municipality"), value: `${municipality}, Nariño` },
                  { label: t("farms.register.altitude"), value: altitude },
                  { label: t("farms.register.area"), value: area },
                  { label: t("farms.register.products"), value: products.map((p) => t(`product.${p}` as MessageKey)).join(", ") },
                  { label: t("farms.register.varieties"), value: varieties },
                  { label: t("lot.coordinates"), value: vertices.map(([a, b]) => `(${a}, ${b})`).join(" · ") },
                ]}
              />
              <Notice variant="info">
                <AlertDescription>{t("farms.eudrHelp")}</AlertDescription>
              </Notice>
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t border-[var(--v-border)] pt-5">
            {step > 1 && (
              <Button type="button" variant="outline" className="min-h-11" onClick={() => go(step - 1)}>
                {t("farms.register.prev")}
              </Button>
            )}
            <Button type="submit" className="min-h-11">
              {step < 3 ? t("farms.register.next") : t("farms.register.submit")}
              <Icon name={step < 3 ? "arrow-right" : "check"} size="sm" />
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}

export function Certificates() {
  const { t, date } = useI18n();
  const { dispatch } = useStore();
  const { farms, certs } = useOwnerData();
  const { farm: findFarm } = useLookups();
  const notify = useNotify();
  const [farmId, setFarmId] = React.useState(farms.find((f) => f.eudr !== "enabled")?.id ?? farms[0]?.id ?? "");
  const [type, setType] = React.useState<CertificateType>("deforestation");
  const [validUntil, setValidUntil] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [tried, setTried] = React.useState(false);
  const [dropKey, setDropKey] = React.useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!file || !validUntil) return;
    dispatch({ type: "uploadCertificate", farmId, certType: type, fileName: file.name, validUntil });
    notify(t("certs.uploaded"));
    setFile(null);
    setValidUntil("");
    setTried(false);
    setDropKey((k) => k + 1);
  };

  return (
    <>
      <PageHeader title={t("certs.title")} lead={t("certs.lead")} />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card>
          <Section title={t("certs.upload")}>
            <form noValidate onSubmit={submit} className="grid gap-5">
              <Field>
                <FieldLabel>{t("certs.farm")}</FieldLabel>
                <FieldControl>
                  <NativeSelect value={farmId} onChange={(e) => setFarmId(e.target.value)}>
                    {farms.map((f) => (
                      <NativeSelectOption key={f.id} value={f.id}>
                        {f.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </FieldControl>
              </Field>
              <Field>
                <FieldLabel>{t("certs.type")}</FieldLabel>
                <FieldControl>
                  <NativeSelect value={type} onChange={(e) => setType(e.target.value as CertificateType)}>
                    {(["origin", "deforestation", "organic"] as const).map((c) => (
                      <NativeSelectOption key={c} value={c}>
                        {t(`cert.${c}` as MessageKey)}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </FieldControl>
              </Field>
              <Field invalid={tried && !validUntil}>
                <FieldLabel>{t("certs.validUntil")}</FieldLabel>
                <FieldControl>
                  <Input type="date" value={validUntil} min="2026-09-29" onChange={(e) => setValidUntil(e.target.value)} required />
                </FieldControl>
                {tried && !validUntil && <FieldError>{t("certs.dateError")}</FieldError>}
              </Field>
              <div className="grid gap-2">
                <span className="text-[length:var(--fs-control)] font-medium" id="cert-file-label">
                  {t("certs.file")}
                </span>
                <Dropzone
                  key={dropKey}
                  accept=".pdf,application/pdf"
                  multiple={false}
                  aria-labelledby="cert-file-label"
                  aria-label={undefined}
                  helpText={t("certs.dropHint")}
                  messages={{ fileType: t("certs.fileTypeError"), notAdded: (name) => t("certs.notAdded", { name }) }}
                  onFilesSelected={(files) => setFile(files[0] ?? null)}
                  showReceipt={false}
                >
                  <span className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-[var(--v-pink-soft)] text-[color:var(--rt-cherry)]">
                      <Icon name={file ? "file-check" : "upload"} size="sm" />
                    </span>
                    <span className="font-medium">{file ? file.name : t("certs.upload")}</span>
                  </span>
                </Dropzone>
                {tried && !file && (
                  <p role="alert" className="text-[length:var(--fs-meta)] text-[color:var(--v-danger-ink)]">
                    {t("certs.fileError")}
                  </p>
                )}
                {file && <FieldDescription role="status">{file.name}</FieldDescription>}
              </div>
              <Button type="submit" className="min-h-11 w-fit">
                <Icon name="upload" size="sm" /> {t("certs.upload")}
              </Button>
            </form>
          </Section>
        </Card>

        <Section title={t("certs.list")}>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("certs.farm")}</TableHead>
                  <TableHead>{t("certs.type")}</TableHead>
                  <TableHead>{t("certs.validUntil")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{findFarm(c.farmId)?.name}</div>
                      <div className="text-[length:var(--fs-meta)] text-[color:var(--v-text-3)]">{c.fileName}</div>
                    </TableCell>
                    <TableCell>{t(`cert.${c.type}` as MessageKey)}</TableCell>
                    <TableCell className="whitespace-nowrap">{date(c.validUntil)}</TableCell>
                    <TableCell>
                      <CertStatusBadge status={c.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Section>
      </div>
    </>
  );
}

export function Samples() {
  const { t, num, dateTime } = useI18n();
  const { txs } = useOwnerData();
  const { lot: findLot } = useLookups();
  const relevant = txs.filter((tx) => tx.stage !== "accepted" && tx.stage !== "resolved");
  return (
    <>
      <PageHeader title={t("samples.title")} lead={t("samples.lead")} />
      {relevant.length === 0 ? (
        <EmptyBlock title={t("samples.empty.title")} text={t("samples.empty.text")} />
      ) : (
        <ul className="grid gap-3">
          {relevant.map((tx) => {
            const lot = findLot(tx.lotId)!;
            return (
              <li key={tx.id}>
                <Card className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{tx.code}</span>
                      <span className="text-[color:var(--v-text-2)]">
                        {t(`product.${lot.product}` as MessageKey)} {lot.variety} · {t("common.kg", { n: num(tx.quantityKg) })}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StageBadge stage={tx.stage} />
                      {tx.sample && (
                        <span className="text-[length:var(--fs-small)] text-[color:var(--v-text-2)]">
                          {tx.sample.code} · {dateTime(tx.sample.at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button asChild variant={tx.stage === "agreed" ? "default" : "outline"} className="min-h-11">
                    <Link to={rolePath("owner", `transactions/${tx.id}`)}>
                      {tx.stage === "agreed" ? (
                        <>
                          <Icon name="flask-conical" size="sm" /> {t("tx.sampleRegister")}
                        </>
                      ) : (
                        t("common.viewDetail")
                      )}
                    </Link>
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/**
 * Casos automatizados del plan de pruebas que se ejecutan sobre el prototipo estático.
 * Se compila con Vite (modo SSR) desde `ejecutar.mjs`, que además expone `reducer` e
 * `initialState` de DemoStore sin modificar el archivo original.
 *
 * Cada caso usa el mismo ID que la hoja "Plan de pruebas" del Excel. El resultado
 * esperado viene de la wiki (RF / RN / RNF), no del código.
 */
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import * as rules from "@/domain/rules";
import * as seed from "@/data/seed";
import { imageCredits } from "@/data/imageCredits";
import { es } from "@/i18n/es";
import { en } from "@/i18n/en";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LotCard } from "@/components/common/LotCard";
// @ts-expect-error: lo exporta el plugin de ejecutar.mjs
import { reducer, initialState } from "@/store/DemoStore";
import type { DemoState } from "@/store/DemoStore";

type Resultado = { obtenido: string; pasa: boolean };
const resultados: Record<string, Resultado> = {};

function caso(id: string, fn: () => Resultado) {
  try {
    resultados[id] = fn();
  } catch (e) {
    resultados[id] = { obtenido: `Error al ejecutar: ${(e as Error).message}`, pasa: false };
  }
}

const S = (v: unknown) => JSON.stringify(v);
const cents = (a: number, b: number) => Math.abs(a - b) < 0.005;
const fresh = (): DemoState => ({ ...initialState(), role: "admin" });
const run = (state: DemoState, ...actions: object[]) => actions.reduce((s, a) => reducer(s, a), state) as DemoState;
const as = (state: DemoState, role: DemoState["role"]) => ({ ...state, role });

/* ---------------- Unitarios: src/domain/rules.ts ---------------- */

caso("MK-007", () => {
  const r = [99, 100, 150].map((v) => rules.validateQuantity(v));
  return { obtenido: `99 kg → ${S(r[0])}; 100 kg → ${S(r[1])}; 150 kg → ${S(r[2])}`, pasa: r[0] === "min" && r[1] === null && r[2] === null };
});

caso("MK-008", () => {
  const r = [rules.validateQuantity(null), rules.validateQuantity(Number.NaN), rules.validateQuantity(600, 500), rules.validateQuantity(500, 500)];
  return {
    obtenido: `vacío → ${S(r[0])}; NaN → ${S(r[1])}; 600 con máx. 500 → ${S(r[2])}; 500 con máx. 500 → ${S(r[3])}`,
    pasa: r[0] === "required" && r[1] === "required" && r[2] === "exceeds" && r[3] === null,
  };
});

caso("TX-006", () => {
  const c = rules.commission(10000);
  return { obtenido: `commission(10000) = ${c} €`, pasa: cents(c, 100) };
});

caso("TX-007", () => {
  const r = [1000, 2500, 3000].map((v) => rules.commission(v));
  return { obtenido: `1000 € → ${r[0]} €; 2500 € → ${r[1]} €; 3000 € → ${r[2]} €`, pasa: cents(r[0], 25) && cents(r[1], 25) && cents(r[2], 30) };
});

caso("TX-008", () => {
  const t = rules.transactionTotals({ quantityKg: 600, pricePerKgEur: 6.8 });
  const ok =
    cents(t.subtotal, 4080) && cents(t.buyerFee, 40.8) && cents(t.sellerFee, 40.8) &&
    cents(t.buyerPays, 4120.8) && cents(t.sellerReceives, 4039.2) && cents(t.platformRevenue, 81.6);
  return {
    obtenido: `subtotal ${t.subtotal}; comisión c/u ${t.buyerFee}; comprador paga ${t.buyerPays}; vendedor recibe ${t.sellerReceives}; plataforma ${t.platformRevenue}`,
    pasa: ok,
  };
});

caso("LG-003", () => {
  const seq: (string | null)[] = [];
  let s: string | null = "sample";
  while (s) {
    s = rules.nextShippingStage(s as never);
    seq.push(s);
  }
  return { obtenido: `sample → ${seq.map((x) => x ?? "null").join(" → ")}`, pasa: S(seq) === S(["prepared", "shipped", "in_transit", "delivered", null]) };
});

caso("LG-004", () => {
  const r = (["agreed", "accepted", "disputed", "resolved"] as const).map((s) => rules.nextShippingStage(s));
  return { obtenido: `agreed → ${r[0]}; accepted → ${r[1]}; disputed → ${r[2]}; resolved → ${r[3]}`, pasa: r.every((x) => x === null) };
});

caso("RNF-005", () => {
  const ke = Object.keys(es), kn = Object.keys(en);
  const faltanEn = ke.filter((k) => !(k in en)), sobranEn = kn.filter((k) => !(k in es));
  const vacias = kn.filter((k) => !String((en as Record<string, string>)[k]).trim());
  return {
    obtenido: `${ke.length} claves en ES, ${kn.length} en EN; faltan en EN: ${faltanEn.length}; sobran: ${sobranEn.length}; vacías: ${vacias.length}`,
    pasa: faltanEn.length === 0 && sobranEn.length === 0 && vacias.length === 0,
  };
});

/* ---------------- Integración: DemoStore (reducer + seed + rules) ---------------- */

const base = fresh();
const lotesAntes = base.lots.length;
const maxLote = Math.max(...base.lots.map((l) => Number(l.code.split("-")[1])));

const nuevoLote = {
  sellerId: "u-seller", farmId: "f-mirador", product: "coffee", variety: "Castillo", process: "washed",
  quantityKg: 300, priceMode: "negotiable", pricePerKgEur: 7, score: 85, harvest: "2026-09", image: "cereza-cafe",
};

caso("MK-009", () => {
  const s = run(as(base, "seller"), { type: "publishLot", lot: nuevoLote });
  const lot = s.lots[0];
  const ok = s.lots.length === lotesAntes + 1 && lot.code === `NAR-${maxLote + 1}` && lot.status === "published" && s.audit[0].action === "publish" && s.audit[0].userId === "u-seller";
  return { obtenido: `Lote ${lot.code} (${lot.status}); lotes ${lotesAntes} → ${s.lots.length}; auditoría "${s.audit[0].action}" por ${s.audit[0].userId}`, pasa: ok };
});

// Flujo principal de negociación y transacción reutilizado por varios casos.
const conLote = run(as(base, "seller"), { type: "publishLot", lot: nuevoLote });
const lotId = conLote.lots[0].id;
const negociando = run(as(conLote, "buyer"), { type: "startNegotiation", lotId, buyerId: "u-buyer", id: "n-test" });

caso("MK-010", () => {
  const n = negociando.negotiations.find((x) => x.id === "n-test")!;
  const lot = negociando.lots.find((l) => l.id === lotId)!;
  return {
    obtenido: `Negociación ${n.status}; oferta inicial ${n.offerPerKgEur} €/kg × ${n.offerQuantityKg} kg; lote pasa a "${lot.status}"`,
    pasa: n.status === "open" && n.offerPerKgEur === 7 && n.offerQuantityKg === 300 && lot.status === "negotiating",
  };
});

caso("MK-011", () => {
  const s = run(negociando,
    { type: "sendMessage", negotiationId: "n-test", from: "u-buyer", text: "Hola, ¿precio por 300 kg?" },
    { type: "sendMessage", negotiationId: "n-test", from: "u-seller", text: "7 €/kg" },
    { type: "sendMessage", negotiationId: "n-test", from: "u-buyer", text: "Ofrezco 6,5 €/kg" });
  const m = s.negotiations.find((x) => x.id === "n-test")!.messages;
  const orden = m.map((x) => x.from).join(", ");
  return { obtenido: `${m.length} mensajes en orden: ${orden}`, pasa: m.length === 3 && orden === "u-buyer, u-seller, u-buyer" && m[2].text === "Ofrezco 6,5 €/kg" };
});

const acordado = run(negociando,
  { type: "updateOffer", negotiationId: "n-test", pricePerKg: 6.5, quantityKg: 300 },
  { type: "agree", negotiationId: "n-test", txId: "t-test" });
const txAcordada = acordado.transactions.find((t) => t.id === "t-test");

caso("MK-012", () => {
  const n = acordado.negotiations.find((x) => x.id === "n-test")!;
  const lot = acordado.lots.find((l) => l.id === lotId)!;
  const t = txAcordada!;
  return {
    obtenido: `Transacción ${t.code}: ${t.quantityKg} kg a ${t.pricePerKgEur} €/kg, etapa "${t.stage}", escrow "${t.escrow}"; negociación "${n.status}"; lote "${lot.status}"`,
    pasa: t.quantityKg === 300 && t.pricePerKgEur === 6.5 && t.stage === "agreed" && t.escrow === "held" && n.status === "agreed" && lot.status === "sold",
  };
});

caso("MK-013", () => {
  const s = run(acordado,
    { type: "updateOffer", negotiationId: "n-test", pricePerKg: 1, quantityKg: 100 },
    { type: "agree", negotiationId: "n-test", txId: "t-duplicada" });
  const t = s.transactions.find((x) => x.id === "t-test")!;
  const dup = s.transactions.some((x) => x.id === "t-duplicada");
  return {
    obtenido: `Tras intentar cambiar la oferta a 1 €/kg × 100 kg: transacción sigue en ${t.pricePerKgEur} €/kg × ${t.quantityKg} kg; segunda transacción creada: ${dup ? "sí" : "no"}`,
    pasa: t.pricePerKgEur === 6.5 && t.quantityKg === 300 && !dup,
  };
});

caso("TX-009", () => {
  const t = txAcordada!;
  const tot = rules.transactionTotals(t);
  return {
    obtenido: `Escrow "${t.escrow}" desde el acuerdo; comprador deja bloqueado ${tot.buyerPays} € (subtotal ${tot.subtotal} + comisión ${tot.buyerFee})`,
    pasa: t.escrow === "held" && cents(tot.buyerPays, 1975),
  };
});

const conMuestra = run(as(acordado, "owner"), { type: "registerSample", txId: "t-test", code: "M-TEST-01", notes: "Taza limpia, 85 pts" });

caso("CL-005", () => {
  const t = conMuestra.transactions.find((x) => x.id === "t-test")!;
  const ignorada = run(conMuestra, { type: "registerSample", txId: "t-test", code: "M-OTRA", notes: "" }).transactions.find((x) => x.id === "t-test")!;
  return {
    obtenido: `Muestra ${t.sample?.code} asociada, etapa "${t.stage}"; segundo registro deja la muestra en ${ignorada.sample?.code}`,
    pasa: t.sample?.code === "M-TEST-01" && t.stage === "sample" && ignorada.sample?.code === "M-TEST-01",
  };
});

caso("LG-005", () => {
  const sinMuestra = run(acordado, { type: "advanceShipping", txId: "t-test" }).transactions.find((x) => x.id === "t-test")!;
  let s = as(conMuestra, "carrier");
  for (let i = 0; i < 6; i++) s = run(s, { type: "advanceShipping", txId: "t-test" });
  const t = s.transactions.find((x) => x.id === "t-test")!;
  const hist = t.history.map((h) => h.stage).join(" → ");
  return {
    obtenido: `Sin muestra se queda en "${sinMuestra.stage}"; con muestra y 6 avances: ${hist}`,
    pasa: sinMuestra.stage === "agreed" && hist === "agreed → sample → prepared → shipped → in_transit → delivered",
  };
});

let entregado = as(conMuestra, "carrier");
for (let i = 0; i < 4; i++) entregado = run(entregado, { type: "advanceShipping", txId: "t-test" });
const verif = (verdict: "accept" | "reject") => ({ checks: { humedad: verdict === "accept" }, notes: "", verdict, at: "2026-09-29T10:00:00" });

caso("CL-006", () => {
  const s = run(as(entregado, "buyer"), { type: "verify", txId: "t-test", verification: verif("accept") });
  const t = s.transactions.find((x) => x.id === "t-test")!;
  return { obtenido: `Etapa "${t.stage}", escrow "${t.escrow}"`, pasa: t.stage === "accepted" && t.escrow === "released" };
});

caso("CL-007", () => {
  const s = run(as(conMuestra, "buyer"), { type: "verify", txId: "t-test", verification: verif("accept") });
  const t = s.transactions.find((x) => x.id === "t-test")!;
  return { obtenido: `Aceptar antes de la entrega: etapa "${t.stage}", escrow "${t.escrow}"`, pasa: t.stage === "sample" && t.escrow === "held" };
});

const enDisputa = run(as(entregado, "buyer"), { type: "verify", txId: "t-test", verification: verif("reject"), reason: "Humedad fuera de rango" });
const disputa = enDisputa.disputes[0];

caso("CL-008", () => {
  const t = enDisputa.transactions.find((x) => x.id === "t-test")!;
  return {
    obtenido: `Etapa "${t.stage}", escrow "${t.escrow}", disputa "${disputa.status}" con motivo "${disputa.reason}"`,
    pasa: t.stage === "disputed" && t.escrow === "held" && disputa.status === "open" && t.disputeId === disputa.id,
  };
});

caso("TX-010", () => {
  const lib = run(as(enDisputa, "admin"), { type: "resolveDispute", disputeId: disputa.id, resolution: "release" });
  const reem = run(as(enDisputa, "admin"), { type: "resolveDispute", disputeId: disputa.id, resolution: "refund" });
  const tl = lib.transactions.find((x) => x.id === "t-test")!, tr = reem.transactions.find((x) => x.id === "t-test")!;
  const otraVez = run(reem, { type: "resolveDispute", disputeId: disputa.id, resolution: "release" }).transactions.find((x) => x.id === "t-test")!;
  return {
    obtenido: `Liberar → escrow "${tl.escrow}" (${tl.stage}); reembolsar → "${tr.escrow}" (${tr.stage}); resolver de nuevo → "${otraVez.escrow}"`,
    pasa: tl.escrow === "released" && tr.escrow === "refunded" && tl.stage === "resolved" && otraVez.escrow === "refunded",
  };
});

// Fincas y certificados (EUDR)
const farm = { ownerId: "u-owner", sellerId: "u-seller", name: "Finca Prueba", municipality: "Sandoná", altitudeM: 1800, areaHa: 3.5, products: ["coffee"], varieties: ["Castillo"], polygon: [[1.28, -77.47], [1.29, -77.47], [1.29, -77.46]] };
const conFinca = run(as(base, "owner"), { type: "registerFarm", farm, id: "f-test" });
const certs = (s: DemoState) => s.certificates.filter((c) => c.farmId === "f-test");
const eudr = (s: DemoState) => s.farms.find((f) => f.id === "f-test")!.eudr;

caso("FN-007", () => {
  const f = conFinca.farms.find((x) => x.id === "f-test")!;
  return { obtenido: `Finca "${f.name}" creada con ${f.polygon.length} vértices, ${f.areaHa} ha, estado EUDR "${f.eudr}"`, pasa: f.eudr === "pending" && f.polygon.length === 3 && f.areaHa === 3.5 };
});

const conCerts = run(conFinca,
  { type: "uploadCertificate", farmId: "f-test", certType: "origin", fileName: "origen.pdf", validUntil: "2027-09-01" },
  { type: "uploadCertificate", farmId: "f-test", certType: "deforestation", fileName: "eudr.pdf", validUntil: "2027-09-01" });

caso("FN-008", () => {
  const cargados = eudr(conCerts);
  let s = as(conCerts, "admin");
  for (const c of certs(s)) s = run(s, { type: "reviewCertificate", certId: c.id, status: "validated" });
  return { obtenido: `Con certificados cargados sin validar: "${cargados}"; tras validar origen y no deforestación: "${eudr(s)}"`, pasa: cargados === "pending" && eudr(s) === "enabled" };
});

caso("FN-009", () => {
  let s = as(conCerts, "admin");
  const [origen, defo] = certs(s);
  s = run(s, { type: "reviewCertificate", certId: origen.id, status: "validated" }, { type: "reviewCertificate", certId: defo.id, status: "rejected" });
  return { obtenido: `Origen validado + no deforestación rechazado → EUDR "${eudr(s)}"`, pasa: eudr(s) !== "enabled" };
});

caso("FN-010", () => {
  let s = run(conFinca,
    { type: "uploadCertificate", farmId: "f-test", certType: "origin", fileName: "origen-vencido.pdf", validUntil: "2026-01-31" },
    { type: "uploadCertificate", farmId: "f-test", certType: "deforestation", fileName: "eudr-vencido.pdf", validUntil: "2026-03-31" });
  for (const c of certs(s)) s = run(s, { type: "reviewCertificate", certId: c.id, status: "validated" });
  return {
    obtenido: `Certificados vencidos (31/01/2026 y 31/03/2026) validados → EUDR "${eudr(s)}"; la función recomputeEudr no consulta validUntil`,
    pasa: eudr(s) !== "enabled",
  };
});

// Usuarios, administración y auditoría
caso("QA-007", () => {
  const b = run(as(base, "admin"), { type: "setUserStatus", userId: "u-buyer2", status: "blocked" });
  const u = run(b, { type: "setUserStatus", userId: "u-buyer2", status: "active" });
  const sb = b.users.find((x) => x.id === "u-buyer2")!.status, su = u.users.find((x) => x.id === "u-buyer2")!.status;
  return { obtenido: `Bloquear → "${sb}" (auditoría "${b.audit[0].action}"); desbloquear → "${su}" (auditoría "${u.audit[0].action}")`, pasa: sb === "blocked" && su === "active" && b.audit[0].action === "block" && u.audit[0].action === "unblock" };
});

caso("QA-008", () => {
  const antes = base.users.find((x) => x.id === "u-buyer4")!.verified;
  const s = run(as(base, "admin"), { type: "verifyUser", userId: "u-buyer4" });
  const despues = s.users.find((x) => x.id === "u-buyer4")!.verified;
  return { obtenido: `u-buyer4 verificado: ${antes} → ${despues}; auditoría "${s.audit[0].action}"`, pasa: antes === false && despues === true && s.audit[0].action === "verify" };
});

caso("AD-003", () => {
  const s = run(as(base, "tech"), { type: "runBackup" });
  const local = new Date(s.lastBackupAt).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
  return { obtenido: `Último respaldo 28/09/2026 17:40 → ${local} (hora local); auditoría "${s.audit[0].action}" sobre ${s.audit[0].target} por ${s.audit[0].userId}`, pasa: s.lastBackupAt !== base.lastBackupAt && s.audit[0].action === "backup" && s.audit[0].userId === "u-tech" };
});

caso("AD-004", () => {
  const pasos: [DemoState["role"], string][] = [];
  const reg = (s: DemoState) => pasos.push([s.role, s.audit[0].action]);
  let s = run(as(base, "seller"), { type: "publishLot", lot: nuevoLote }); reg(s);
  s = run(as(s, "admin"), { type: "setUserStatus", userId: "u-buyer2", status: "blocked" }); reg(s);
  s = run(as(s, "tech"), { type: "runBackup" }); reg(s);
  const esperado = [["seller", "publish"], ["admin", "block"], ["tech", "backup"]];
  const usuarios = s.audit.slice(0, 3).reverse().map((a) => a.userId);
  return {
    obtenido: `Acciones registradas: ${pasos.map((p) => p.join(":")).join(", ")}; usuarios: ${usuarios.join(", ")}; entradas nuevas ${s.audit.length - base.audit.length}`,
    pasa: S(pasos) === S(esperado) && S(usuarios) === S(["u-seller", "u-admin", "u-tech"]),
  };
});

caso("AD-005", () => {
  const modificado = run(as(base, "admin"), { type: "setUserStatus", userId: "u-buyer2", status: "blocked" }, { type: "runBackup" });
  const r = run(modificado, { type: "reset" });
  const igual = S(r.users) === S(seed.users) && S(r.lots) === S(seed.lots) && S(r.audit) === S(seed.audit);
  return { obtenido: `Tras reset: datos iguales a la semilla = ${igual}; rol conservado = ${r.role}`, pasa: igual && r.role === "admin" };
});

/* ---------------- Privacidad RN-13: LotCard renderizado ---------------- */

caso("QA-009", () => {
  const filtraciones: string[] = [];
  // Control positivo: un lote cuya variedad contiene la finca y el municipio debe detectarse.
  const f0 = seed.farms[0];
  const control = { ...seed.lots[0], code: "CONTROL", farmId: f0.id, variety: `${f0.name} ${f0.municipality}` };
  for (const lot of [...seed.lots, control]) {
    const html = renderToString(
      <I18nProvider>
        <MemoryRouter>
          <LotCard lot={lot} to={`/buyer/catalog/${lot.id}`} showStatus />
        </MemoryRouter>
      </I18nProvider>,
    );
    const f = seed.farms.find((x) => x.id === lot.farmId)!;
    // Altitud con su unidad para no confundirla con cantidades o años ("20" dentro de "2000 kg").
    const texto = html.replace(/<[^>]+>/g, " ");
    const datos: [string, RegExp][] = [
      ["finca", new RegExp(f.name)],
      ["municipio", new RegExp(f.municipality)],
      ["altitud", new RegExp(`\\b${f.altitudeM}(\\.\\d{3})*\\s?m\\b`)],
      ...f.polygon.map(([la, ln]): [string, RegExp] => ["coordenada", new RegExp(`${String(la).replace(".", "[.,]")}|${String(ln).replace(".", "[.,]")}`)]),
    ];
    for (const [nombre, re] of datos) {
      if (re.test(texto)) filtraciones.push(`${lot.code}: ${nombre}`);
    }
  }
  const controlDetectado = filtraciones.some((x) => x.startsWith("CONTROL"));
  const reales = filtraciones.filter((x) => !x.startsWith("CONTROL"));
  return {
    obtenido: (reales.length ? `Datos privados visibles: ${reales.join("; ")}` : `${seed.lots.length} tarjetas renderizadas; ninguna muestra nombre de finca, municipio, altitud ni coordenadas`) + `; control positivo detectado: ${controlDetectado ? "sí" : "no"}`,
    pasa: reales.length === 0 && controlDetectado,
  };
});

/* ---------------- Créditos de imágenes (licencias CC) ---------------- */

caso("RNF-006", () => {
  // La lista de archivos la inyecta ejecutar.mjs para no depender de fs aquí.
  const archivos: string[] = (globalThis as unknown as { __IMAGENES__: string[] }).__IMAGENES__;
  const ids = new Set(imageCredits.map((c) => c.id));
  const sinCredito = archivos.map((f) => f.replace(/\.[^.]+$/, "")).filter((id) => !ids.has(id as never));
  const incompletos = imageCredits.filter((c) => !c.author || !c.license || !c.source || !c.alt.es || !c.alt.en).map((c) => c.id);
  return {
    obtenido: `${archivos.length} imágenes en public/images, ${imageCredits.length} créditos; sin crédito: ${sinCredito.length ? sinCredito.join(", ") : "ninguna"}; créditos incompletos: ${incompletos.length ? incompletos.join(", ") : "ninguno"}`,
    pasa: sinCredito.length === 0 && incompletos.length === 0,
  };
});

export default resultados;

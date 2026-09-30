import * as React from "react";
import * as seed from "@/data/seed";
import { nextShippingStage } from "@/domain/rules";
import type {
  AuditEntry,
  Certificate,
  CertificateType,
  Dispute,
  Farm,
  Lot,
  Negotiation,
  Role,
  Transaction,
  TxStage,
  User,
  Verification,
} from "@/domain/types";

/**
 * Estado en memoria compartido por todos los roles. No hay backend: al recargar la
 * página se vuelve a los datos de ejemplo. Así el flujo completo se puede recorrer
 * cambiando de rol (propietario → vendedor → comprador → transportador → admin).
 */
export type DemoState = {
  role: Role | null;
  users: User[];
  farms: Farm[];
  certificates: Certificate[];
  lots: Lot[];
  negotiations: Negotiation[];
  transactions: Transaction[];
  disputes: Dispute[];
  audit: AuditEntry[];
  lastBackupAt: string;
};

const ROLE_KEY = "ritech.role";

function initialState(): DemoState {
  let role: Role | null = null;
  try {
    const stored = localStorage.getItem(ROLE_KEY);
    if (stored && stored in seed.demoUserByRole) role = stored as Role;
  } catch {
    // sin almacenamiento: se empieza sin rol
  }
  return {
    role,
    users: structuredClone(seed.users),
    farms: structuredClone(seed.farms),
    certificates: structuredClone(seed.certificates),
    lots: structuredClone(seed.lots),
    negotiations: structuredClone(seed.negotiations),
    transactions: structuredClone(seed.transactions),
    disputes: structuredClone(seed.disputes),
    audit: structuredClone(seed.audit),
    lastBackupAt: "2026-09-28T17:40:00",
  };
}

type Action =
  | { type: "setRole"; role: Role | null }
  | { type: "reset" }
  | { type: "publishLot"; lot: Omit<Lot, "id" | "code" | "status" | "publishedAt"> }
  | { type: "startNegotiation"; lotId: string; buyerId: string; id: string }
  | { type: "sendMessage"; negotiationId: string; from: string; text: string }
  | { type: "updateOffer"; negotiationId: string; pricePerKg: number; quantityKg: number }
  | { type: "agree"; negotiationId: string; txId: string }
  | { type: "registerSample"; txId: string; code: string; notes: string }
  | { type: "advanceShipping"; txId: string }
  | { type: "verify"; txId: string; verification: Verification; reason?: string }
  | { type: "resolveDispute"; disputeId: string; resolution: "release" | "refund" }
  | { type: "registerFarm"; farm: Omit<Farm, "id" | "eudr" | "registeredAt" | "image">; id: string }
  | { type: "uploadCertificate"; farmId: string; certType: CertificateType; fileName: string; validUntil: string }
  | { type: "reviewCertificate"; certId: string; status: "validated" | "rejected" }
  | { type: "setUserStatus"; userId: string; status: User["status"] }
  | { type: "verifyUser"; userId: string }
  | { type: "runBackup" };

const now = () => new Date().toISOString();
let seq = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${(seq++).toString(36)}`;

function log(state: DemoState, action: string, target: string): AuditEntry[] {
  const userId = state.role ? seed.demoUserByRole[state.role] : "u-admin";
  return [{ id: uid("a"), at: now(), userId, action, target }, ...state.audit];
}

/** Una finca queda habilitada (EUDR) cuando tiene origen y no deforestación validados. */
function recomputeEudr(farms: Farm[], certs: Certificate[]): Farm[] {
  return farms.map((farm) => {
    if (farm.eudr === "blocked") return farm;
    const ok = (type: CertificateType) =>
      certs.some((c) => c.farmId === farm.id && c.type === type && c.status === "validated");
    return { ...farm, eudr: ok("origin") && ok("deforestation") ? "enabled" : "pending" };
  });
}

function withStage(tx: Transaction, stage: TxStage): Transaction {
  return { ...tx, stage, history: [...tx.history, { stage, at: now() }] };
}

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "setRole":
      return { ...state, role: action.role };
    case "reset":
      return { ...initialState(), role: state.role };
    case "publishLot": {
      const next = Math.max(...state.lots.map((l) => Number(l.code.split("-")[1]))) + 1;
      const lot: Lot = { ...action.lot, id: uid("l"), code: `NAR-${next}`, status: "published", publishedAt: now() };
      return { ...state, lots: [lot, ...state.lots], audit: log(state, "publish", lot.code) };
    }
    case "startNegotiation": {
      const lot = state.lots.find((l) => l.id === action.lotId);
      if (!lot) return state;
      const negotiation: Negotiation = {
        id: action.id,
        lotId: lot.id,
        buyerId: action.buyerId,
        sellerId: lot.sellerId,
        messages: [],
        offerPerKgEur: lot.pricePerKgEur,
        offerQuantityKg: lot.quantityKg,
        status: "open",
      };
      return {
        ...state,
        negotiations: [negotiation, ...state.negotiations],
        lots: state.lots.map((l) => (l.id === lot.id ? { ...l, status: "negotiating" } : l)),
      };
    }
    case "sendMessage": {
      const negotiations = state.negotiations.map((n) =>
        n.id === action.negotiationId
          ? { ...n, messages: [...n.messages, { id: uid("m"), from: action.from, text: action.text, at: now() }] }
          : n,
      );
      const lot = state.lots.find((l) => l.id === state.negotiations.find((n) => n.id === action.negotiationId)?.lotId);
      return { ...state, negotiations, audit: log(state, "message", lot?.code ?? "—") };
    }
    case "updateOffer":
      return {
        ...state,
        negotiations: state.negotiations.map((n) =>
          n.id === action.negotiationId && n.status === "open"
            ? { ...n, offerPerKgEur: action.pricePerKg, offerQuantityKg: action.quantityKg }
            : n,
        ),
      };
    case "agree": {
      const neg = state.negotiations.find((n) => n.id === action.negotiationId);
      if (!neg || neg.status !== "open" || neg.offerPerKgEur === null) return state;
      const code = `TX-${String(Math.max(...state.transactions.map((t) => Number(t.code.split("-")[1]))) + 1).padStart(4, "0")}`;
      const tx: Transaction = {
        id: action.txId,
        code,
        negotiationId: neg.id,
        lotId: neg.lotId,
        buyerId: neg.buyerId,
        sellerId: neg.sellerId,
        carrierId: "u-carrier",
        quantityKg: neg.offerQuantityKg,
        pricePerKgEur: neg.offerPerKgEur,
        agreedAt: now(),
        escrow: "held",
        stage: "agreed",
        history: [{ stage: "agreed", at: now() }],
      };
      return {
        ...state,
        transactions: [tx, ...state.transactions],
        negotiations: state.negotiations.map((n) =>
          n.id === neg.id ? { ...n, status: "agreed", transactionId: tx.id } : n,
        ),
        lots: state.lots.map((l) => (l.id === neg.lotId ? { ...l, status: "sold" } : l)),
        audit: log(state, "agree", code),
      };
    }
    case "registerSample": {
      const tx = state.transactions.find((t) => t.id === action.txId);
      if (!tx || tx.stage !== "agreed") return state;
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === tx.id ? withStage({ ...t, sample: { code: action.code, notes: action.notes, at: now() } }, "sample") : t,
        ),
        audit: log(state, "sample", tx.code),
      };
    }
    case "advanceShipping": {
      const tx = state.transactions.find((t) => t.id === action.txId);
      const next = tx && nextShippingStage(tx.stage);
      if (!tx || !next) return state;
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === tx.id ? withStage(t, next) : t)),
        audit: log(state, "tracker", tx.code),
      };
    }
    case "verify": {
      const tx = state.transactions.find((t) => t.id === action.txId);
      if (!tx || tx.stage !== "delivered") return state;
      if (action.verification.verdict === "accept") {
        return {
          ...state,
          transactions: state.transactions.map((t) =>
            t.id === tx.id ? withStage({ ...t, verification: action.verification, escrow: "released" }, "accepted") : t,
          ),
          audit: log(state, "accept", tx.code),
        };
      }
      const dispute: Dispute = {
        id: uid("d"),
        transactionId: tx.id,
        reason: action.reason ?? "",
        openedAt: now(),
        status: "open",
      };
      return {
        ...state,
        disputes: [dispute, ...state.disputes],
        transactions: state.transactions.map((t) =>
          t.id === tx.id ? withStage({ ...t, verification: action.verification, disputeId: dispute.id }, "disputed") : t,
        ),
        audit: log(state, "dispute", tx.code),
      };
    }
    case "resolveDispute": {
      const dispute = state.disputes.find((d) => d.id === action.disputeId);
      if (!dispute || dispute.status !== "open") return state;
      const tx = state.transactions.find((t) => t.id === dispute.transactionId);
      return {
        ...state,
        disputes: state.disputes.map((d) =>
          d.id === dispute.id ? { ...d, status: "resolved", resolution: action.resolution, resolvedAt: now() } : d,
        ),
        transactions: state.transactions.map((t) =>
          t.id === dispute.transactionId
            ? withStage({ ...t, escrow: action.resolution === "release" ? "released" : "refunded" }, "resolved")
            : t,
        ),
        audit: log(state, "resolve", tx?.code ?? "—"),
      };
    }
    case "registerFarm": {
      const farm: Farm = {
        ...action.farm,
        id: action.id,
        eudr: "pending",
        registeredAt: now(),
        image: action.farm.products.includes("cacao") && !action.farm.products.includes("coffee") ? "cacao-fruto" : "cafe-flor",
      };
      return { ...state, farms: [...state.farms, farm], audit: log(state, "farm", farm.name) };
    }
    case "uploadCertificate": {
      const cert: Certificate = {
        id: uid("c"),
        farmId: action.farmId,
        type: action.certType,
        fileName: action.fileName,
        issuedBy: "—",
        validUntil: action.validUntil,
        status: "pending",
        uploadedAt: now(),
      };
      const certificates = [...state.certificates, cert];
      return {
        ...state,
        certificates,
        farms: recomputeEudr(state.farms, certificates),
        audit: log(state, "certificate", cert.fileName),
      };
    }
    case "reviewCertificate": {
      const certificates = state.certificates.map((c) =>
        c.id === action.certId ? { ...c, status: action.status } : c,
      );
      const cert = state.certificates.find((c) => c.id === action.certId);
      return {
        ...state,
        certificates,
        farms: recomputeEudr(state.farms, certificates),
        audit: log(state, "validate", cert?.fileName ?? "—"),
      };
    }
    case "setUserStatus": {
      const user = state.users.find((u) => u.id === action.userId);
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.userId ? { ...u, status: action.status } : u)),
        audit: log(state, action.status === "blocked" ? "block" : "unblock", user?.organization ?? "—"),
      };
    }
    case "verifyUser": {
      const user = state.users.find((u) => u.id === action.userId);
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.userId ? { ...u, verified: true } : u)),
        audit: log(state, "verify", user?.organization ?? "—"),
      };
    }
    case "runBackup": {
      const at = now();
      return { ...state, lastBackupAt: at, audit: log(state, "backup", "rds-ritech-prod") };
    }
  }
}

type Store = {
  state: DemoState;
  dispatch: React.Dispatch<Action>;
  me: User | null;
  newId: (prefix: string) => string;
};

const StoreContext = React.createContext<Store | null>(null);

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, initialState);

  React.useEffect(() => {
    try {
      if (state.role) localStorage.setItem(ROLE_KEY, state.role);
      else localStorage.removeItem(ROLE_KEY);
    } catch {
      // sin almacenamiento: el rol no se recuerda entre recargas
    }
  }, [state.role]);

  const me = state.role ? state.users.find((u) => u.id === seed.demoUserByRole[state.role!]) ?? null : null;
  const value = React.useMemo(() => ({ state, dispatch, me, newId: uid }), [state, me]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de DemoStoreProvider");
  return ctx;
}

/** Selectores de apoyo. */
export function useLookups() {
  const { state } = useStore();
  return React.useMemo(
    () => ({
      user: (id: string) => state.users.find((u) => u.id === id),
      farm: (id: string) => state.farms.find((f) => f.id === id),
      lot: (id: string) => state.lots.find((l) => l.id === id),
      tx: (id: string) => state.transactions.find((t) => t.id === id),
      dispute: (id: string) => state.disputes.find((d) => d.id === id),
      negotiation: (id: string) => state.negotiations.find((n) => n.id === id),
      certsOf: (farmId: string) => state.certificates.filter((c) => c.farmId === farmId),
    }),
    [state],
  );
}

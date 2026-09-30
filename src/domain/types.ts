export type Role = "buyer" | "seller" | "owner" | "carrier" | "admin" | "tech";
export const ROLES: readonly Role[] = ["buyer", "seller", "owner", "carrier", "admin", "tech"];

export type Product = "coffee" | "cacao";

export type User = {
  id: string;
  name: string;
  role: Role;
  organization: string;
  country: string;
  city: string;
  status: "active" | "blocked";
  verified: boolean;
  joinedAt: string;
};

export type EudrStatus = "enabled" | "pending" | "blocked";

export type Farm = {
  id: string;
  ownerId: string;
  /** Vendedor autorizado a publicar lotes de esta finca (RN: el vendedor puede ser el propietario o una empresa). */
  sellerId: string;
  name: string;
  municipality: string;
  altitudeM: number;
  areaHa: number;
  products: Product[];
  varieties: string[];
  polygon: [number, number][];
  eudr: EudrStatus;
  image: string;
  registeredAt: string;
};

export type CertificateType = "origin" | "deforestation" | "organic";
export type Certificate = {
  id: string;
  farmId: string;
  type: CertificateType;
  fileName: string;
  issuedBy: string;
  validUntil: string;
  status: "pending" | "validated" | "rejected";
  uploadedAt: string;
};

export type LotStatus = "published" | "negotiating" | "sold";
export type Lot = {
  id: string;
  code: string;
  sellerId: string;
  farmId: string;
  product: Product;
  variety: string;
  process: string;
  quantityKg: number;
  priceMode: "fixed" | "negotiable";
  /** EUR por kg; en modo negociable es el precio de referencia. */
  pricePerKgEur: number;
  /** Puntaje de ejemplo (SCA para café, % de fermentación en prueba de corte para cacao). */
  score: number;
  harvest: string;
  status: LotStatus;
  image: string;
  publishedAt: string;
};

export type ChatMessage = { id: string; from: string; text: string; at: string };

export type Negotiation = {
  id: string;
  lotId: string;
  buyerId: string;
  sellerId: string;
  messages: ChatMessage[];
  offerPerKgEur: number | null;
  offerQuantityKg: number;
  status: "open" | "agreed" | "closed";
  transactionId?: string;
};

export type TxStage =
  | "agreed"
  | "sample"
  | "prepared"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "accepted"
  | "disputed"
  | "resolved";

export type Escrow = "held" | "released" | "refunded";

export type Verification = {
  checks: Record<string, boolean>;
  notes: string;
  verdict: "accept" | "reject";
  at: string;
};

export type Transaction = {
  id: string;
  code: string;
  negotiationId: string;
  lotId: string;
  buyerId: string;
  sellerId: string;
  carrierId: string;
  quantityKg: number;
  pricePerKgEur: number;
  agreedAt: string;
  escrow: Escrow;
  stage: TxStage;
  sample?: { code: string; notes: string; at: string };
  verification?: Verification;
  history: { stage: TxStage; at: string }[];
  disputeId?: string;
};

export type Dispute = {
  id: string;
  transactionId: string;
  reason: string;
  openedAt: string;
  status: "open" | "resolved";
  resolution?: "release" | "refund";
  resolvedAt?: string;
};

export type AuditEntry = {
  id: string;
  at: string;
  userId: string;
  action: string;
  target: string;
};

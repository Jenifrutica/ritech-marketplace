import type {
  AuditEntry,
  Certificate,
  Dispute,
  Farm,
  Lot,
  Negotiation,
  Role,
  Transaction,
  User,
} from "@/domain/types";

/** Datos ficticios de la demo. Ninguna persona, finca ni empresa es real. */

export const users: User[] = [
  { id: "u-buyer", name: "Hanna Keller", role: "buyer", organization: "Kaffeehaus Nord GmbH", country: "DE", city: "Hamburgo", status: "active", verified: true, joinedAt: "2026-06-12" },
  { id: "u-buyer2", name: "Luca Bianchi", role: "buyer", organization: "Torrefazione Alpina S.r.l.", country: "IT", city: "Milán", status: "active", verified: true, joinedAt: "2026-07-03" },
  { id: "u-buyer3", name: "Mark Olsen", role: "buyer", organization: "Nordic Beans Trading", country: "DK", city: "Copenhague", status: "blocked", verified: false, joinedAt: "2026-08-21" },
  { id: "u-buyer4", name: "Claire Dubois", role: "buyer", organization: "Maison Cacao Lyon", country: "FR", city: "Lyon", status: "active", verified: false, joinedAt: "2026-09-24" },
  { id: "u-seller", name: "Andrea Muñoz", role: "seller", organization: "Asociación Agrocafé Galeras", country: "CO", city: "Pasto", status: "active", verified: true, joinedAt: "2026-05-30" },
  { id: "u-owner", name: "Jorge Enríquez", role: "owner", organization: "Finca El Mirador", country: "CO", city: "La Unión", status: "active", verified: true, joinedAt: "2026-05-28" },
  { id: "u-owner2", name: "Rosa Cabrera", role: "owner", organization: "Finca Villa Rosa", country: "CO", city: "Tumaco", status: "active", verified: true, joinedAt: "2026-06-02" },
  { id: "u-carrier", name: "Carlos Benavides", role: "carrier", organization: "Transportes Andinos del Sur", country: "CO", city: "Pasto", status: "active", verified: true, joinedAt: "2026-06-15" },
  { id: "u-admin", name: "Paula Ortega", role: "admin", organization: "RiTech SAS", country: "CO", city: "Pasto", status: "active", verified: true, joinedAt: "2026-05-01" },
  { id: "u-tech", name: "Diego Rosales", role: "tech", organization: "RiTech SAS", country: "CO", city: "Pasto", status: "active", verified: true, joinedAt: "2026-05-01" },
];

/** Usuario con el que se entra a cada rol en la demo. */
export const demoUserByRole: Record<Role, string> = {
  buyer: "u-buyer",
  seller: "u-seller",
  owner: "u-owner",
  carrier: "u-carrier",
  admin: "u-admin",
  tech: "u-tech",
};

export const farms: Farm[] = [
  {
    id: "f-mirador", ownerId: "u-owner", sellerId: "u-seller", name: "Finca El Mirador", municipality: "La Unión",
    altitudeM: 1850, areaHa: 4.5, products: ["coffee"], varieties: ["Caturra", "Castillo"],
    polygon: [[1.6021, -77.1312], [1.6034, -77.1288], [1.6012, -77.1271], [1.5998, -77.1297]],
    eudr: "enabled", image: "cafetal", registeredAt: "2026-06-01",
  },
  {
    id: "f-esperanza", ownerId: "u-owner", sellerId: "u-seller", name: "Finca La Esperanza", municipality: "Buesaco",
    altitudeM: 1950, areaHa: 3.2, products: ["coffee"], varieties: ["Geisha", "Caturra"],
    polygon: [[1.3845, -77.1571], [1.3861, -77.1549], [1.3840, -77.1532], [1.3826, -77.1556]],
    eudr: "enabled", image: "finca-cafe", registeredAt: "2026-06-04",
  },
  {
    id: "f-altobonito", ownerId: "u-owner", sellerId: "u-seller", name: "Finca Alto Bonito", municipality: "Sandoná",
    altitudeM: 1700, areaHa: 2.8, products: ["coffee"], varieties: ["Colombia"],
    polygon: [[1.2862, -77.4705], [1.2877, -77.4686], [1.2859, -77.4668], [1.2846, -77.4690]],
    eudr: "pending", image: "cafe-flor", registeredAt: "2026-09-18",
  },
  {
    id: "f-villarosa", ownerId: "u-owner2", sellerId: "u-seller", name: "Finca Villa Rosa", municipality: "Tumaco",
    altitudeM: 20, areaHa: 6, products: ["cacao"], varieties: ["Fino de aroma", "CCN-51"],
    polygon: [[1.8012, -78.7641], [1.8030, -78.7615], [1.8008, -78.7598], [1.7991, -78.7624]],
    eudr: "enabled", image: "cacao-mazorcas", registeredAt: "2026-06-06",
  },
];

export const certificates: Certificate[] = [
  { id: "c-1", farmId: "f-mirador", type: "origin", fileName: "origen-el-mirador.pdf", issuedBy: "Comité de Cafeteros de Nariño", validUntil: "2027-06-01", status: "validated", uploadedAt: "2026-06-01" },
  { id: "c-2", farmId: "f-mirador", type: "deforestation", fileName: "eudr-el-mirador.pdf", issuedBy: "Verificador EUDR", validUntil: "2027-05-15", status: "validated", uploadedAt: "2026-06-01" },
  { id: "c-3", farmId: "f-esperanza", type: "origin", fileName: "origen-la-esperanza.pdf", issuedBy: "Comité de Cafeteros de Nariño", validUntil: "2027-06-04", status: "validated", uploadedAt: "2026-06-04" },
  { id: "c-4", farmId: "f-esperanza", type: "deforestation", fileName: "eudr-la-esperanza.pdf", issuedBy: "Verificador EUDR", validUntil: "2026-11-10", status: "validated", uploadedAt: "2026-06-04" },
  { id: "c-5", farmId: "f-esperanza", type: "organic", fileName: "organico-la-esperanza.pdf", issuedBy: "Certificadora orgánica", validUntil: "2027-02-28", status: "validated", uploadedAt: "2026-06-10" },
  { id: "c-6", farmId: "f-altobonito", type: "origin", fileName: "origen-alto-bonito.pdf", issuedBy: "Comité de Cafeteros de Nariño", validUntil: "2027-09-18", status: "pending", uploadedAt: "2026-09-18" },
  { id: "c-7", farmId: "f-villarosa", type: "origin", fileName: "origen-villa-rosa.pdf", issuedBy: "Fedecacao", validUntil: "2027-06-06", status: "validated", uploadedAt: "2026-06-06" },
  { id: "c-8", farmId: "f-villarosa", type: "deforestation", fileName: "eudr-villa-rosa.pdf", issuedBy: "Verificador EUDR", validUntil: "2027-06-06", status: "validated", uploadedAt: "2026-06-06" },
];

export const lots: Lot[] = [
  { id: "l-2401", code: "NAR-2401", sellerId: "u-seller", farmId: "f-mirador", product: "coffee", variety: "Caturra", process: "washed", quantityKg: 1200, priceMode: "fixed", pricePerKgEur: 9.8, score: 86.5, harvest: "2026-05", status: "published", image: "cereza-cafe", publishedAt: "2026-09-02" },
  { id: "l-2402", code: "NAR-2402", sellerId: "u-seller", farmId: "f-esperanza", product: "coffee", variety: "Geisha", process: "honey", quantityKg: 350, priceMode: "negotiable", pricePerKgEur: 18.5, score: 88.75, harvest: "2026-06", status: "negotiating", image: "cafe-flor", publishedAt: "2026-09-05" },
  { id: "l-2403", code: "NAR-2403", sellerId: "u-seller", farmId: "f-villarosa", product: "cacao", variety: "Fino de aroma", process: "fermented", quantityKg: 2000, priceMode: "fixed", pricePerKgEur: 7.2, score: 82, harvest: "2026-07", status: "published", image: "cacao-fruto", publishedAt: "2026-09-08" },
  { id: "l-2404", code: "NAR-2404", sellerId: "u-seller", farmId: "f-mirador", product: "coffee", variety: "Castillo", process: "natural", quantityKg: 800, priceMode: "negotiable", pricePerKgEur: 8.4, score: 84, harvest: "2026-05", status: "published", image: "cereza-abierta", publishedAt: "2026-09-12" },
  { id: "l-2405", code: "NAR-2405", sellerId: "u-seller", farmId: "f-villarosa", product: "cacao", variety: "CCN-51", process: "fermented", quantityKg: 1500, priceMode: "fixed", pricePerKgEur: 5.9, score: 78, harvest: "2026-04", status: "sold", image: "cacao-mazorcas", publishedAt: "2026-07-10" },
  { id: "l-2406", code: "NAR-2406", sellerId: "u-seller", farmId: "f-esperanza", product: "coffee", variety: "Caturra", process: "washed", quantityKg: 600, priceMode: "fixed", pricePerKgEur: 10.2, score: 85.25, harvest: "2026-06", status: "sold", image: "cafe-verde", publishedAt: "2026-08-01" },
  { id: "l-2407", code: "NAR-2407", sellerId: "u-seller", farmId: "f-mirador", product: "coffee", variety: "Castillo", process: "washed", quantityKg: 450, priceMode: "fixed", pricePerKgEur: 9.1, score: 84.5, harvest: "2026-05", status: "sold", image: "cafe-verde", publishedAt: "2026-07-22" },
  { id: "l-2408", code: "NAR-2408", sellerId: "u-seller", farmId: "f-esperanza", product: "coffee", variety: "Geisha", process: "natural", quantityKg: 300, priceMode: "negotiable", pricePerKgEur: 19, score: 89, harvest: "2026-06", status: "sold", image: "cereza-cafe", publishedAt: "2026-07-28" },
  { id: "l-2409", code: "NAR-2409", sellerId: "u-seller", farmId: "f-mirador", product: "coffee", variety: "Caturra", process: "honey", quantityKg: 500, priceMode: "fixed", pricePerKgEur: 10.6, score: 86, harvest: "2026-06", status: "sold", image: "cereza-abierta", publishedAt: "2026-09-10" },
];

export const negotiations: Negotiation[] = [
  {
    id: "n-1", lotId: "l-2402", buyerId: "u-buyer", sellerId: "u-seller", offerPerKgEur: 17.2, offerQuantityKg: 350, status: "open",
    messages: [
      { id: "m-1", from: "u-buyer", text: "Buenos días. Nos interesa el lote Geisha completo. ¿Pueden enviar el perfil de taza?", at: "2026-09-26T09:12:00" },
      { id: "m-2", from: "u-seller", text: "Con gusto. Notas a jazmín, mandarina y panela; 88,75 puntos en la catación de ejemplo.", at: "2026-09-26T10:40:00" },
      { id: "m-3", from: "u-buyer", text: "Proponemos 17,20 EUR/kg por los 350 kg.", at: "2026-09-27T08:05:00" },
      { id: "m-4", from: "u-seller", text: "Lo revisamos con la asociación y respondemos hoy.", at: "2026-09-27T11:30:00" },
    ],
  },
  {
    id: "n-2", lotId: "l-2406", buyerId: "u-buyer", sellerId: "u-seller", offerPerKgEur: 10.2, offerQuantityKg: 600, status: "agreed", transactionId: "t-1",
    messages: [
      { id: "m-5", from: "u-buyer", text: "Compramos el lote al precio publicado.", at: "2026-08-20T14:00:00" },
      { id: "m-6", from: "u-seller", text: "Perfecto, confirmamos la venta.", at: "2026-08-20T15:10:00" },
    ],
  },
  {
    id: "n-3", lotId: "l-2407", buyerId: "u-buyer", sellerId: "u-seller", offerPerKgEur: 9.1, offerQuantityKg: 450, status: "agreed", transactionId: "t-2",
    messages: [{ id: "m-7", from: "u-buyer", text: "Confirmamos la compra de los 450 kg.", at: "2026-08-02T09:00:00" }],
  },
  {
    id: "n-4", lotId: "l-2405", buyerId: "u-buyer2", sellerId: "u-seller", offerPerKgEur: 5.9, offerQuantityKg: 1500, status: "agreed", transactionId: "t-3",
    messages: [{ id: "m-8", from: "u-buyer2", text: "Tomamos el lote de cacao.", at: "2026-07-15T10:00:00" }],
  },
  {
    id: "n-5", lotId: "l-2408", buyerId: "u-buyer2", sellerId: "u-seller", offerPerKgEur: 18.4, offerQuantityKg: 300, status: "agreed", transactionId: "t-4",
    messages: [{ id: "m-9", from: "u-buyer2", text: "Acordamos 18,40 EUR/kg.", at: "2026-08-05T16:20:00" }],
  },
  {
    id: "n-6", lotId: "l-2409", buyerId: "u-buyer", sellerId: "u-seller", offerPerKgEur: 10.6, offerQuantityKg: 500, status: "agreed", transactionId: "t-5",
    messages: [{ id: "m-10", from: "u-buyer", text: "Compramos al precio publicado.", at: "2026-09-25T12:00:00" }],
  },
];

export const transactions: Transaction[] = [
  {
    id: "t-1", code: "TX-0921", negotiationId: "n-2", lotId: "l-2406", buyerId: "u-buyer", sellerId: "u-seller", carrierId: "u-carrier",
    quantityKg: 600, pricePerKgEur: 10.2, agreedAt: "2026-08-20T15:10:00", escrow: "held", stage: "in_transit",
    sample: { code: "M-0921", notes: "Muestra de 500 g sellada.", at: "2026-08-24T10:00:00" },
    history: [
      { stage: "agreed", at: "2026-08-20T15:10:00" },
      { stage: "sample", at: "2026-08-24T10:00:00" },
      { stage: "prepared", at: "2026-09-10T08:30:00" },
      { stage: "shipped", at: "2026-09-14T06:00:00" },
      { stage: "in_transit", at: "2026-09-16T18:45:00" },
    ],
  },
  {
    id: "t-2", code: "TX-0877", negotiationId: "n-3", lotId: "l-2407", buyerId: "u-buyer", sellerId: "u-seller", carrierId: "u-carrier",
    quantityKg: 450, pricePerKgEur: 9.1, agreedAt: "2026-08-02T09:00:00", escrow: "held", stage: "delivered",
    sample: { code: "M-0877", notes: "Muestra de 500 g sellada.", at: "2026-08-05T09:00:00" },
    history: [
      { stage: "agreed", at: "2026-08-02T09:00:00" },
      { stage: "sample", at: "2026-08-05T09:00:00" },
      { stage: "prepared", at: "2026-08-18T08:00:00" },
      { stage: "shipped", at: "2026-08-21T07:00:00" },
      { stage: "in_transit", at: "2026-08-23T12:00:00" },
      { stage: "delivered", at: "2026-09-26T15:30:00" },
    ],
  },
  {
    id: "t-3", code: "TX-0712", negotiationId: "n-4", lotId: "l-2405", buyerId: "u-buyer2", sellerId: "u-seller", carrierId: "u-carrier",
    quantityKg: 1500, pricePerKgEur: 5.9, agreedAt: "2026-07-15T10:00:00", escrow: "released", stage: "accepted",
    sample: { code: "M-0712", notes: "Muestra de 1 kg.", at: "2026-07-18T09:00:00" },
    verification: { checks: { humidity: true, defects: true, cut: true, aroma: true }, notes: "Coincide con la muestra.", verdict: "accept", at: "2026-08-30T11:00:00" },
    history: [
      { stage: "agreed", at: "2026-07-15T10:00:00" },
      { stage: "sample", at: "2026-07-18T09:00:00" },
      { stage: "prepared", at: "2026-07-25T08:00:00" },
      { stage: "shipped", at: "2026-07-28T07:00:00" },
      { stage: "in_transit", at: "2026-07-30T12:00:00" },
      { stage: "delivered", at: "2026-08-28T10:00:00" },
      { stage: "accepted", at: "2026-08-30T11:00:00" },
    ],
  },
  {
    id: "t-4", code: "TX-0745", negotiationId: "n-5", lotId: "l-2408", buyerId: "u-buyer2", sellerId: "u-seller", carrierId: "u-carrier",
    quantityKg: 300, pricePerKgEur: 18.4, agreedAt: "2026-08-05T16:20:00", escrow: "held", stage: "disputed", disputeId: "d-1",
    sample: { code: "M-0745", notes: "Muestra de 500 g.", at: "2026-08-08T09:00:00" },
    verification: { checks: { humidity: false, defects: true, cup: false, aroma: true }, notes: "Humedad de 13,5% frente a 11% de la muestra.", verdict: "reject", at: "2026-09-22T10:00:00" },
    history: [
      { stage: "agreed", at: "2026-08-05T16:20:00" },
      { stage: "sample", at: "2026-08-08T09:00:00" },
      { stage: "prepared", at: "2026-08-20T08:00:00" },
      { stage: "shipped", at: "2026-08-23T07:00:00" },
      { stage: "in_transit", at: "2026-08-25T12:00:00" },
      { stage: "delivered", at: "2026-09-20T10:00:00" },
      { stage: "disputed", at: "2026-09-22T10:00:00" },
    ],
  },
  {
    id: "t-5", code: "TX-0958", negotiationId: "n-6", lotId: "l-2409", buyerId: "u-buyer", sellerId: "u-seller", carrierId: "u-carrier",
    quantityKg: 500, pricePerKgEur: 10.6, agreedAt: "2026-09-25T12:00:00", escrow: "held", stage: "agreed",
    history: [{ stage: "agreed", at: "2026-09-25T12:00:00" }],
  },
];

export const disputes: Dispute[] = [
  { id: "d-1", transactionId: "t-4", reason: "La humedad del producto recibido (13,5%) no coincide con la muestra (11%).", openedAt: "2026-09-22T10:00:00", status: "open" },
];

export const audit: AuditEntry[] = [
  { id: "a-1", at: "2026-09-29T08:02:00", userId: "u-admin", action: "login", target: "—" },
  { id: "a-2", at: "2026-09-28T17:40:00", userId: "u-tech", action: "backup", target: "rds-ritech-prod" },
  { id: "a-3", at: "2026-09-27T11:30:00", userId: "u-seller", action: "message", target: "NAR-2402" },
  { id: "a-4", at: "2026-09-26T15:30:00", userId: "u-carrier", action: "tracker", target: "TX-0877" },
  { id: "a-5", at: "2026-09-25T12:00:00", userId: "u-buyer", action: "agree", target: "TX-0958" },
  { id: "a-6", at: "2026-09-24T09:15:00", userId: "u-buyer4", action: "register", target: "Maison Cacao Lyon" },
  { id: "a-7", at: "2026-09-22T10:00:00", userId: "u-buyer2", action: "dispute", target: "TX-0745" },
  { id: "a-8", at: "2026-09-21T16:05:00", userId: "u-admin", action: "block", target: "Nordic Beans Trading" },
  { id: "a-9", at: "2026-09-18T10:20:00", userId: "u-owner", action: "certificate", target: "origen-alto-bonito.pdf" },
  { id: "a-10", at: "2026-09-12T14:00:00", userId: "u-seller", action: "publish", target: "NAR-2404" },
];

/** Ventas mensuales de ejemplo del vendedor (EUR). */
export const monthlySales = [
  { month: 4, coffee: 0, cacao: 0 },
  { month: 5, coffee: 4200, cacao: 0 },
  { month: 6, coffee: 6100, cacao: 3800 },
  { month: 7, coffee: 5400, cacao: 8850 },
  { month: 8, coffee: 15600, cacao: 0 },
  { month: 9, coffee: 11420, cacao: 0 },
];

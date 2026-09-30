import type { Transaction, TxStage } from "@/domain/types";

/** RN-1: cantidad mínima por exportación. */
export const MIN_KG = 100;

/** RN-11: comisión del 1% a comprador y vendedor. */
export const COMMISSION_RATE = 0.01;

/**
 * Valor mínimo de la comisión. Confluence no define la cifra: es un VALOR DE EJEMPLO
 * y la interfaz lo presenta así.
 */
export const MIN_COMMISSION_EUR = 25;

/** Tasa de cambio de ejemplo para mostrar montos en COP. */
export const EXAMPLE_COP_PER_EUR = 4400;

export function commission(amountEur: number): number {
  return Math.max(amountEur * COMMISSION_RATE, MIN_COMMISSION_EUR);
}

export function transactionTotals(tx: Pick<Transaction, "quantityKg" | "pricePerKgEur">) {
  const subtotal = tx.quantityKg * tx.pricePerKgEur;
  const fee = commission(subtotal);
  return {
    subtotal,
    buyerFee: fee,
    sellerFee: fee,
    /** Lo que el comprador deja bloqueado en escrow. */
    buyerPays: subtotal + fee,
    /** Lo que recibe el vendedor al liberarse el pago. */
    sellerReceives: subtotal - fee,
    platformRevenue: fee * 2,
  };
}

/** Etapas del tracker de logística que actualiza el transportador (RN-14). */
export const SHIPPING_STAGES: TxStage[] = ["prepared", "shipped", "in_transit", "delivered"];

/** Recorrido completo de una transacción, en orden. */
export const TX_FLOW: TxStage[] = ["agreed", "sample", ...SHIPPING_STAGES, "accepted"];

export function nextShippingStage(stage: TxStage): TxStage | null {
  if (stage === "sample") return "prepared";
  const i = SHIPPING_STAGES.indexOf(stage);
  if (i === -1 || i === SHIPPING_STAGES.length - 1) return null;
  return SHIPPING_STAGES[i + 1];
}

export function stageIndex(stage: TxStage): number {
  if (stage === "disputed" || stage === "resolved") return TX_FLOW.indexOf("delivered") + 1;
  return TX_FLOW.indexOf(stage);
}

export type QuantityError = "required" | "min" | "exceeds";
export function validateQuantity(value: number | null, max?: number): QuantityError | null {
  if (value === null || Number.isNaN(value)) return "required";
  if (value < MIN_KG) return "min";
  if (max !== undefined && value > max) return "exceeds";
  return null;
}

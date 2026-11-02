export const DEBT_QUEUE = "bizflow-debt-queue";
export const DEBT_SNAPSHOT = "bizflow-debt-items";

export type SavedDebt = {
  id: string;
  name: string;
  note: string;
  balance: number;
  amount: number;
  paid: number;
  phone: string | null;
  shop: string;
};

export type QueuedPayment = {
  id: string;
  debtId: string;
  name: string;
  payment: number;
};

export function readDebtQueue(): QueuedPayment[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DEBT_QUEUE) || "[]");
  } catch {
    return [];
  }
}

export function writeDebtQueue(items: QueuedPayment[]) {
  localStorage.setItem(DEBT_QUEUE, JSON.stringify(items));
}

export function readDebtSnapshot(): SavedDebt[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DEBT_SNAPSHOT) || "[]");
  } catch {
    return [];
  }
}

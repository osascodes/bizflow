export const COST_QUEUE = "bizflow-cost-queue";

export type QueuedCost = {
  id: string;
  title: string;
  category: string;
  amount: number;
};

export function readCostQueue(): QueuedCost[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(COST_QUEUE) || "[]");
  } catch {
    return [];
  }
}

export function writeCostQueue(items: QueuedCost[]) {
  localStorage.setItem(COST_QUEUE, JSON.stringify(items));
}

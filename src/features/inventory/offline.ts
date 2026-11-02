export const STOCK_QUEUE = "bizflow-stock-queue";
export const STOCK_SNAPSHOT = "bizflow-stock-items";

export type SavedProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string | null;
};

export type QueuedStock = {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  description: string | null;
};

export function readStockQueue(): QueuedStock[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STOCK_QUEUE) || "[]");
  } catch {
    return [];
  }
}

export function writeStockQueue(items: QueuedStock[]) {
  localStorage.setItem(STOCK_QUEUE, JSON.stringify(items));
}

export function readStockSnapshot(): SavedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STOCK_SNAPSHOT) || "[]");
  } catch {
    return [];
  }
}

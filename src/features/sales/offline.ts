export const SALE_QUEUE = "bizflow-sale-queue";
export const SALE_PRODUCTS = "bizflow-sale-products";
export const SALE_CUSTOMERS = "bizflow-sale-customers";

export type QueuedSale = {
  id: string;
  items: { product_id: string; quantity: number }[];
  customer_id: string;
  on_credit: boolean;
  label: string;
  total: number;
};

export function readQueue(): QueuedSale[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SALE_QUEUE) || "[]");
  } catch {
    return [];
  }
}

export function writeQueue(items: QueuedSale[]) {
  localStorage.setItem(SALE_QUEUE, JSON.stringify(items));
}

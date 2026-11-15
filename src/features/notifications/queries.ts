import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { getProducts } from "@/features/inventory/queries";

type OrderRow = {
  id: string;
  order_number: string | null;
  product_name: string;
  quantity: number;
  customer_name: string;
  status: string;
  created_at: string;
  products: { price?: number } | { price?: number }[] | null;
};

function priceOf(row: OrderRow) {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;
  return Number(product?.price || 0);
}

export async function getNotifications() {
  const business = await getCurrentBusiness();
  if (!business) return [];

  const supabase = await createServerSupabase();
  const [products, { data: orders }, { data: debts }, { data: sales }] = await Promise.all([
    getProducts(),
    supabase
      .from("orders")
      .select("id, order_number, product_name, quantity, customer_name, status, created_at, products(price)")
      .eq("business_id", business.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("debts")
      .select("id, amount, paid, created_at, customers(name)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("sales")
      .select("id, total, created_at, sale_items(name, quantity)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const groups = new Map<string, { id: string; customer: string; items: string[]; status: string; total: number; at: string }>();
  for (const order of (orders ?? []) as OrderRow[]) {
    const key = order.order_number || order.id;
    const line = `${order.quantity}x ${order.product_name}`;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(line);
      existing.total += Number(order.quantity) * priceOf(order);
      if (order.created_at > existing.at) existing.at = order.created_at;
      continue;
    }
    groups.set(key, {
      id: key,
      customer: order.customer_name,
      items: [line],
      status: order.status,
      total: Number(order.quantity) * priceOf(order),
      at: order.created_at || "",
    });
  }

  const items = [
    ...[...groups.values()].map((order) => ({
      id: `order-${order.id}`,
      title: "New order",
      detail: `${order.customer} • ${order.items.join(", ")}\n${order.status === "pending" ? "Pending" : order.status} • ₦${order.total.toLocaleString()}`,
      href: `/storefront?order=${encodeURIComponent(order.id)}`,
      at: order.at,
    })),
    ...(sales ?? []).map((sale) => {
      const lines = (sale.sale_items ?? []).map((item: { name: string; quantity: number }) => `${item.quantity}x ${item.name}`);
      return {
        id: `sale-${sale.id}`,
        title: "Sale recorded",
        detail: `${lines.join(", ") || "Sale"} — ₦${Number(sale.total).toLocaleString()}`,
        href: `/sales/${sale.id}`,
        at: sale.created_at || "",
      };
    }),
    ...(debts ?? [])
      .filter((debt) => Number(debt.amount) > Number(debt.paid))
      .map((debt) => ({
        id: `debt-${debt.id}`,
        title: `${(Array.isArray(debt.customers) ? debt.customers[0]?.name : "A customer") || "A customer"} still owes`,
        detail: `₦${(Number(debt.amount) - Number(debt.paid)).toLocaleString()}`,
        href: "/debts",
        at: debt.created_at || "",
      })),
    ...products
      .filter((product) => product.stock <= product.low_stock_at)
      .map((product) => ({
        id: `stock-${product.id}`,
        title: `${product.name} is low`,
        detail: `${product.stock} left`,
        href: "/inventory",
        at: "",
      })),
  ].sort((a, b) => String(b.at).localeCompare(String(a.at)));

  return items;
}

export async function getAlertCount() {
  const items = await getNotifications();
  return items.length;
}

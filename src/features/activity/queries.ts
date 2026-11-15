import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getActivity() {
  const business = await getCurrentBusiness();
  if (!business) return [];

  const supabase = await createServerSupabase();
  const [{ data: sales }, { data: expenses }, { data: orders }] = await Promise.all([
    supabase.from("sales").select("id, total, created_at, sale_items(name, quantity)").eq("business_id", business.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("expenses").select("id, title, amount, created_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("orders").select("id, order_number, customer_name, product_name, quantity, status, created_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(40),
  ]);

  const groups = new Map<string, { id: string; customer: string; items: string[]; createdAt: string }>();
  for (const order of orders ?? []) {
    const key = order.order_number || order.id;
    const line = `${order.quantity}x ${order.product_name}`;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(line);
      if (order.created_at > existing.createdAt) existing.createdAt = order.created_at;
      continue;
    }
    groups.set(key, { id: key, customer: order.customer_name, items: [line], createdAt: order.created_at || "" });
  }

  const items = [
    ...(sales ?? []).map((sale) => ({
      id: `sale-${sale.id}`,
      title: "Sale recorded",
      detail: `${(sale.sale_items ?? []).map((item: { quantity: number; name: string }) => `${item.quantity}x ${item.name}`).join(", ") || "Sale"} — ₦${Number(sale.total).toLocaleString()}`,
      createdAt: sale.created_at,
    })),
    ...(expenses ?? []).map((expense) => ({
      id: `expense-${expense.id}`,
      title: "Cost added",
      detail: `${expense.title} · ₦${Number(expense.amount).toLocaleString()}`,
      createdAt: expense.created_at,
    })),
    ...[...groups.values()].map((order) => ({
      id: `order-${order.id}`,
      title: "New order",
      detail: `${order.customer} · ${order.items.join(", ")}`,
      createdAt: order.createdAt,
    })),
  ];

  return items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

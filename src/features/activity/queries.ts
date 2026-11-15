import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getActivity() {
  const business = await getCurrentBusiness();
  if (!business) return [];

  const supabase = await createServerSupabase();
  const [{ data: sales }, { data: expenses }, { data: orders }, { data: debts }, paymentsResult] = await Promise.all([
    supabase.from("sales").select("id, total, created_at, sale_items(name, quantity)").eq("business_id", business.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("expenses").select("id, title, amount, created_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("orders").select("id, order_number, customer_name, product_name, quantity, status, created_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(40),
    supabase.from("debts").select("id, amount, created_at, customers(name)").eq("business_id", business.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("debt_payments").select("id, amount, created_at, debts(customers(name))").eq("business_id", business.id).order("created_at", { ascending: false }).limit(20),
  ]);
  const payments = paymentsResult.error ? [] : paymentsResult.data ?? [];

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
    ...(debts ?? []).map((debt) => {
      const customers = debt.customers as { name?: string } | { name?: string }[] | null;
      const name = Array.isArray(customers) ? customers[0]?.name : customers?.name;
      return {
        id: `debt-${debt.id}`,
        title: "Debt recorded",
        detail: `${name || "Customer"} · ₦${Number(debt.amount).toLocaleString()}`,
        createdAt: debt.created_at,
      };
    }),
    ...(payments ?? []).map((payment) => {
      const debt = (Array.isArray(payment.debts) ? payment.debts[0] : payment.debts) as { customers?: { name?: string } | { name?: string }[] } | null;
      const customers = debt?.customers;
      const name = Array.isArray(customers) ? customers[0]?.name : customers?.name;
      return {
        id: `payment-${payment.id}`,
        title: "Debt payment received",
        detail: `${name || "Customer"} · ₦${Number(payment.amount).toLocaleString()}`,
        createdAt: payment.created_at,
      };
    }),
  ];

  return items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

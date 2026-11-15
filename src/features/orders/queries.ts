import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getOrdersToDo() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("orders")
    .select("id, order_number, product_name, quantity, customer_name, status, created_at")
    .eq("business_id", business.id)
    .in("status", ["pending", "packed", "out"])
    .order("created_at", { ascending: false });
  const groups = new Map<string, { id: string; customer: string; items: string[]; status: string; createdAt: string; number: string }>();
  for (const order of data ?? []) {
    const key = order.order_number || order.id;
    const existing = groups.get(key);
    const line = `${order.quantity} x ${order.product_name}`;
    if (existing) {
      existing.items.push(line);
      if (order.created_at && order.created_at > existing.createdAt) existing.createdAt = order.created_at;
      continue;
    }
    groups.set(key, {
      id: key,
      customer: order.customer_name,
      items: [line],
      status: order.status,
      createdAt: order.created_at || "",
      number: order.order_number || order.id.slice(0, 6).toUpperCase(),
    });
  }
  return [...groups.values()];
}

export async function getOrdersToDoCount() {
  const orders = await getOrdersToDo();
  return orders.length;
}

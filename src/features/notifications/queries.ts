import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { getProducts } from "@/features/inventory/queries";

export async function getNotifications() {
  const business = await getCurrentBusiness();
  if (!business) return [];

  const supabase = await createServerSupabase();
  const [products, { data: orders }, { data: debts }] = await Promise.all([
    getProducts(),
    supabase
      .from("orders")
      .select("id, product_name, quantity, customer_name, status, created_at")
      .eq("business_id", business.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("debts")
      .select("id, amount, paid, created_at, customers(name)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const items = [
    ...(orders ?? []).map((order) => ({
      id: `order-${order.id}`,
      title: `New order from ${order.customer_name}`,
      detail: `${order.quantity} x ${order.product_name}`,
      href: "/storefront",
      at: order.created_at || "",
    })),
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

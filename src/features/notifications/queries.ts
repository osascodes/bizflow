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
      .select("id, product_name, quantity, customer_name, status")
      .eq("business_id", business.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("debts")
      .select("id, amount, paid, customers(name)")
      .eq("business_id", business.id)
      .limit(20),
  ]);

  const items = [
    ...products
      .filter((product) => product.stock <= product.low_stock_at)
      .map((product) => ({
        id: `stock-${product.id}`,
        title: `${product.name} is low`,
        detail: `${product.stock} left`,
        href: "/inventory",
      })),
    ...(orders ?? []).map((order) => ({
      id: `order-${order.id}`,
      title: `New order from ${order.customer_name}`,
      detail: `${order.quantity} x ${order.product_name}`,
      href: "/storefront",
    })),
    ...(debts ?? [])
      .filter((debt) => Number(debt.amount) > Number(debt.paid))
      .map((debt) => ({
        id: `debt-${debt.id}`,
        title: `${debt.customers?.name || "A customer"} still owes`,
        detail: `₦${(Number(debt.amount) - Number(debt.paid)).toLocaleString()}`,
        href: "/debts",
      })),
  ];

  return items;
}

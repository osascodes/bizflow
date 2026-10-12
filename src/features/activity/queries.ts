import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getActivity() {
  const business = await getCurrentBusiness();
  if (!business) return [];

  const supabase = await createServerSupabase();
  const [{ data: sales }, { data: expenses }, { data: orders }, { data: products }] = await Promise.all([
    supabase.from("sales").select("id, total, created_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(15),
    supabase.from("expenses").select("id, title, amount, created_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(15),
    supabase.from("orders").select("id, customer_name, product_name, quantity, created_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(15),
    supabase.from("products").select("id, name, created_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(15),
  ]);

  const items = [
    ...(sales ?? []).map((sale) => ({
      id: `sale-${sale.id}`,
      title: "Sale recorded",
      detail: `₦${Number(sale.total).toLocaleString()}`,
      createdAt: sale.created_at,
    })),
    ...(expenses ?? []).map((expense) => ({
      id: `expense-${expense.id}`,
      title: "Cost added",
      detail: `${expense.title} · ₦${Number(expense.amount).toLocaleString()}`,
      createdAt: expense.created_at,
    })),
    ...(orders ?? []).map((order) => ({
      id: `order-${order.id}`,
      title: "Store order",
      detail: `${order.customer_name} · ${order.quantity} x ${order.product_name}`,
      createdAt: order.created_at,
    })),
    ...(products ?? []).map((product) => ({
      id: `product-${product.id}`,
      title: "Product added",
      detail: product.name,
      createdAt: product.created_at,
    })),
  ];

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 30);
}

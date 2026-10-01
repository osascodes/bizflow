import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getProducts() {
  const business = await getCurrentBusiness();
  if (!business) return [];

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select("id, name, price, stock, low_stock_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getLowStockCount() {
  const products = await getProducts();
  return products.filter((product) => product.stock <= product.low_stock_at).length;
}

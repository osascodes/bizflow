import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import StoreClient from "@/features/orders/components/StoreClient";

export default async function PublicStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, phone, category, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!business) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, stock")
    .eq("business_id", business.id)
    .gt("stock", 0)
    .order("name");

  return <StoreClient business={business} products={products ?? []} />;
}

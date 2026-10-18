import { createServerSupabase } from "@/lib/supabase/server";
import StoreClient from "@/features/orders/components/StoreClient";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string | null;
  description?: string | null;
  created_at?: string | null;
};

export default async function PublicStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, name, phone, category, slug, logo_url, instagram, tiktok, website, hero_url, store_headline, store_description")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Shop not found</h1>
          <p className="mt-3 text-sm text-zinc-400">Looked for /store/{slug}</p>
          <p className="mt-2 text-sm text-red-300">{error?.message || "No shop uses this link."}</p>
        </div>
      </main>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, stock, image_url, description, created_at")
    .eq("business_id", business.id)
    .order("name");

  const list = (products ?? []) as Product[];
  const inStock = list.filter((product) => product.stock > 0);
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const fresh = inStock
    .filter((product) => product.created_at && new Date(product.created_at).getTime() >= cutoff)
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 6);

  const { data: sold } = await supabase.rpc("store_best_sellers", { shop_id: business.id });
  const soldRows = Array.isArray(sold) ? sold : [];
  const byId = new Map(inStock.map((product) => [product.id, product]));
  const best = soldRows
    .map((row: { product_id: string }) => byId.get(row.product_id))
    .filter(Boolean) as Product[];

  return <StoreClient business={business} products={list} fresh={fresh} best={best} />;
}

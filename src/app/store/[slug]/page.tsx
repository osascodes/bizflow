import { createServerSupabase } from "@/lib/supabase/server";
import StoreClient from "@/features/orders/components/StoreClient";

export default async function PublicStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, name, phone, category, slug")
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
    .select("id, name, price, stock, image_url")
    .eq("business_id", business.id)
    .gt("stock", 0)
    .order("name");

  return <StoreClient business={business} products={products ?? []} />;
}

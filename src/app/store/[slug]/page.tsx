import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function PublicStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, phone, category")
    .eq("slug", slug)
    .maybeSingle();

  if (!business) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, stock")
    .eq("business_id", business.id)
    .gt("stock", 0)
    .order("name");

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-lg">
        <p className="text-sm text-violet-300">{business.category}</p>
        <h1 className="mt-2 text-3xl font-semibold">{business.name}</h1>
        {business.phone ? <p className="mt-2 text-sm text-zinc-400">{business.phone}</p> : null}
        <div className="mt-8 space-y-3">
          {(products ?? []).length === 0 ? (
            <p className="text-sm text-zinc-500">Nothing in stock right now.</p>
          ) : (
            (products ?? []).map((product) => (
              <div key={product.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{product.name}</h2>
                    <p className="mt-1 text-sm text-zinc-500">{product.stock} left</p>
                  </div>
                  <p>₦{Number(product.price).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

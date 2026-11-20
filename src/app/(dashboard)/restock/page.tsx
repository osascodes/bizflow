import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getProducts } from "@/features/inventory/queries";

export default async function RestockPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  const products = await getProducts();
  const low = products
    .filter((product) => product.stock <= product.low_stock_at)
    .map((product) => ({
      ...product,
      need: Math.max(product.low_stock_at - product.stock, product.stock === 0 ? product.low_stock_at || 1 : 1),
    }))
    .sort((a, b) => a.stock - b.stock);

  const lines = [
    business.name,
    "Restock list",
    ...(low.length
      ? low.map((product) => `${product.name}: ${product.stock} left, add ${product.need}`)
      : ["Nothing to restock."]),
  ];

  return (
    <main className="px-4 py-8 pb-28 md:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold text-zinc-950">Restock</h1>
        <p className="mt-2 text-sm text-zinc-500">Products at or below their low-stock warning.</p>
        <div className="mt-5 space-y-3">
          {low.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-500">Nothing to restock.</div>
          ) : low.map((product) => (
            <div key={product.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-950">{product.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">{product.stock} left · warn at {product.low_stock_at}</p>
                </div>
                <p className="text-sm font-semibold text-[#635BFF]">Add {product.need}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`}
            target="_blank"
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#635BFF] text-sm font-semibold text-white"
          >
            Share on WhatsApp
          </a>
          <Link href="/inventory?focus=low" className="flex h-12 flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-950">
            Open products
          </Link>
        </div>
      </div>
    </main>
  );
}

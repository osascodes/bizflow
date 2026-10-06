import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import PrintButton from "@/features/sales/components/PrintButton";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  const supabase = await createServerSupabase();
  const { data: sale } = await supabase
    .from("sales")
    .select("id, total, created_at, sale_items(name, quantity, price)")
    .eq("id", id)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!sale) notFound();

  const items = sale.sale_items ?? [];

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-md">
        <Link href="/sales" className="text-sm text-zinc-400 hover:text-white print:hidden">
          Back to sales
        </Link>
        <article className="mt-4 rounded-2xl border border-zinc-800 bg-white p-6 text-zinc-950 print:border-0">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Receipt</p>
          <h1 className="mt-1 text-2xl font-semibold">{business.name}</h1>
          {business.phone ? <p className="mt-1 text-sm text-zinc-500">{business.phone}</p> : null}
          <p className="mt-1 text-sm text-zinc-500">{new Date(sale.created_at).toLocaleString()}</p>
          <div className="mt-6 space-y-3 border-t border-zinc-200 pt-4">
            {items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-zinc-500">
                    {item.quantity} x ₦{Number(item.price).toLocaleString()}
                  </p>
                </div>
                <p>₦{(Number(item.price) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 text-base font-semibold">
            <span>Total</span>
            <span>₦{Number(sale.total).toLocaleString()}</span>
          </div>
          <p className="mt-6 text-center text-xs text-zinc-500">Thank you for shopping with us</p>
        </article>
        <PrintButton />
      </div>
    </main>
  );
}

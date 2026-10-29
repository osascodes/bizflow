import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { updateOrderStatusAction } from "@/features/orders/actions";
import BusinessEditor from "@/features/business/components/BusinessEditor";
import { Button } from "@/components/ui/button";

export default async function StorefrontPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  const isOwner = business.role === "owner";

  const supabase = await createServerSupabase();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, product_name, quantity, customer_name, customer_phone, status, created_at, order_number")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-white">Store</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {isOwner ? "Change the name, then save. The link updates after save." : "Store orders for this shop."}
        </p>
        {isOwner ? (
          <BusinessEditor business={business} />
        ) : (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Shop</p>
            <p className="mt-1 font-semibold text-white">{business.name}</p>
            <p className="mt-1 text-sm text-zinc-400">{business.phone} · {business.category}</p>
            <p className="mt-3 text-sm text-violet-300">/store/{business.slug}</p>
          </div>
        )}
        <div className="mt-8 space-y-3">
          {(orders ?? []).length === 0 ? (
            <p className="text-sm text-zinc-500">No orders yet.</p>
          ) : (
            (orders ?? []).map((order) => (
              <div key={order.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-white">{order.quantity} x {order.product_name}</h2>
                    <p className="mt-1 text-sm text-zinc-400">{order.customer_name} · {order.customer_phone}</p>
                    <p className="mt-1 text-xs text-zinc-500">{order.order_number || order.status} · {order.status}</p>
                  </div>
                  <a className="text-sm text-violet-300" href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`} target="_blank">
                    WhatsApp
                  </a>
                </div>
                {order.status === "pending" || order.status === "packed" || order.status === "out" ? (
                  <form action={updateOrderStatusAction} className="mt-3 flex gap-2">
                    <input type="hidden" name="order_id" value={order.id} />
                    {order.status === "pending" ? <Button name="status" value="packed" type="submit" className="h-9">Pack</Button> : null}
                    {order.status === "packed" ? <Button name="status" value="out" type="submit" className="h-9">Out</Button> : null}
                    {order.status === "out" ? <Button name="status" value="done" type="submit" className="h-9">Delivered</Button> : null}
                    {order.status === "pending" ? <Button name="status" value="cancelled" type="submit" variant="outline" className="h-9">Cancel</Button> : null}
                  </form>
                ) : (
                  <p className="mt-3 text-xs capitalize text-zinc-500">{order.status === "done" ? "Delivered" : order.status}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

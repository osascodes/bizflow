import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getAnalytics } from "@/features/analytics/queries";

export default async function AnalyticsPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  const analytics = await getAnalytics();
  const max = Math.max(...analytics.days.map((day) => day.total), 1);
  const left = analytics.weekSales - analytics.weekCosts;

  const cards = [
    ["This week", analytics.weekSales],
    ["This month", analytics.monthSales],
    ["Costs this week", analytics.weekCosts],
    ["Left this week", left],
  ];

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <p className="mt-2 text-sm text-zinc-400">Sales, costs, top products, and low stock.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">₦{Number(value).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="font-semibold text-white">Last 7 days</h2>
          <div className="mt-6 flex h-44 items-end gap-3">
            {analytics.days.map((day) => (
              <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-fuchsia-500"
                    style={{ height: `${Math.max(8, (day.total / max) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500">{day.label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="font-semibold text-white">Top products this month</h2>
            <div className="mt-4 space-y-3">
              {analytics.topProducts.length === 0 ? (
                <p className="text-sm text-zinc-500">No sales yet.</p>
              ) : (
                analytics.topProducts.map((product) => (
                  <div key={product.name} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{product.name}</p>
                      <p className="text-xs text-zinc-500">{product.quantity} sold</p>
                    </div>
                    <p className="text-sm text-zinc-300">₦{product.amount.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="font-semibold text-white">Low stock</h2>
            <div className="mt-4 space-y-3">
              {analytics.lowStock.length === 0 ? (
                <p className="text-sm text-zinc-500">Nothing is low.</p>
              ) : (
                analytics.lowStock.map((product) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <p className="text-sm text-white">{product.name}</p>
                    <p className="text-sm text-amber-300">{product.stock} left</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

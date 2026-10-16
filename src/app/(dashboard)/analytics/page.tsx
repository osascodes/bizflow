import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getAnalytics } from "@/features/analytics/queries";

export default async function AnalyticsPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  if (business.role !== "owner") redirect("/dashboard");

  const analytics = await getAnalytics();
  const max = Math.max(...analytics.days.map((day) => day.total), 1);
  const left = analytics.weekSales - analytics.weekCosts;
  const hasWeekSales = analytics.weekSales > 0;

  const cards = [
    ["This week", analytics.weekSales],
    ["This month", analytics.monthSales],
    ["Costs this week", analytics.weekCosts],
    ["Left this week", left],
  ];

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-violet-300">{business.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Analytics</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">Sales, costs, what is selling, and what is running low.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value]) => (
            <div key={String(label)} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">₦{Number(value).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white">Last 7 days</h2>
              <p className="mt-1 text-sm text-zinc-500">This month can be higher if the sales were before these 7 days.</p>
            </div>
            <p className="text-sm text-zinc-400">₦{analytics.weekSales.toLocaleString()}</p>
          </div>
          {hasWeekSales ? (
            <div className="mt-8 flex h-48 items-end gap-3">
              {analytics.days.map((day) => (
                <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                  <p className="text-[11px] text-zinc-500">₦{day.total.toLocaleString()}</p>
                  <div className="flex h-32 w-full items-end">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-violet-600 to-fuchsia-400"
                      style={{ height: `${Math.max(8, (day.total / max) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-400">{day.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 px-4 py-10 text-center">
              <p className="text-sm text-zinc-300">No sales in the last 7 days.</p>
              <p className="mt-2 text-sm text-zinc-500">This month is ₦{analytics.monthSales.toLocaleString()}. Those sales were earlier than this week.</p>
            </div>
          )}
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="font-semibold text-white">Top products this month</h2>
            <div className="mt-4 space-y-4">
              {analytics.topProducts.length === 0 ? (
                <p className="text-sm text-zinc-500">No sales yet.</p>
              ) : (
                analytics.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-300">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{product.name}</p>
                      <p className="text-xs text-zinc-500">{product.quantity} sold</p>
                    </div>
                    <p className="text-sm text-zinc-200">₦{product.amount.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="font-semibold text-white">Low stock</h2>
            <div className="mt-4 space-y-4">
              {analytics.lowStock.length === 0 ? (
                <p className="text-sm text-zinc-500">Nothing is low.</p>
              ) : (
                analytics.lowStock.map((product) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <p className="text-sm text-white">{product.name}</p>
                    <p className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-200">{product.stock} left</p>
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

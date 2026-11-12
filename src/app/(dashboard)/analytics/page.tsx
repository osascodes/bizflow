import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getAnalytics } from "@/features/analytics/queries";
import SavedStats from "@/features/analytics/components/SavedStats";

export default async function AnalyticsPage() {
  const { offline } = await getAuthState();
  let business = null;
  try {
    business = await getCurrentBusiness();
  } catch {
    business = null;
  }
  if (!business) {
    if (!offline) {
      const { user } = await getAuthState();
      if (user) redirect("/onboarding");
      redirect("/login");
    }
    return <SavedStats offline />;
  }
  if (business.role !== "owner") redirect("/dashboard");

  const analytics = await getAnalytics();
  const max = Math.max(...analytics.days.map((day) => day.total), 1);
  const left = analytics.weekSales - analytics.weekCosts;
  const hasWeekSales = analytics.weekSales > 0;

  const cards = [
    { label: "This week", value: analytics.weekSales, tone: "from-[#635BFF]/20 to-[#635BFF]/5", accent: "text-[#635BFF]" },
    { label: "This month", value: analytics.monthSales, tone: "from-[#635BFF]/15 to-[#635BFF]/5", accent: "text-[#635BFF]" },
    { label: "Costs this week", value: analytics.weekCosts, tone: "from-amber-500/20 to-amber-500/5", accent: "text-amber-700" },
    { label: "Left this week", value: left, tone: left >= 0 ? "from-emerald-500/20 to-emerald-500/5" : "from-rose-500/20 to-rose-500/5", accent: left >= 0 ? "text-emerald-700" : "text-rose-700" },
  ];

  return (
    <>
      <SavedStats
        snapshot={{
          name: business.name,
          weekSales: analytics.weekSales,
          monthSales: analytics.monthSales,
          weekCosts: analytics.weekCosts,
          days: analytics.days,
          topProducts: analytics.topProducts,
          lowStock: analytics.lowStock,
        }}
      />
    <main className="px-4 py-6 pb-28 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <p className="mt-1 text-sm text-zinc-500">Understand your business performance</p>
          </div>
          <label className="inline-flex items-center gap-+2 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#635BFF]" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>
            <select defaultValue="7" className="bg-transparent text-xs font-medium outline-none">
              <option value="7">Last 7 days</option>
              <option value="30">This month</option>
            </select>
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {cards.map((card) => (
            <div key={card.label} className={`rounded-2xl border border-zinc-200 bg-gradient-to-br ${card.tone} p-4`}>
              <p className={`text-sm font-medium ${card.accent}`}>{card.label}</p>
              <p className="mt-2 text-2xl font-semibold">₦{Number(card.value).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Sales overview</h2>
            <span className="flex items-center gap-1 text-xs text-zinc-500"><span className="h-2 w-2 rounded-full bg-[#635BFF]" /> Sales</span>
          </div>
          {hasWeekSales ? (
            <div className="mt-6">
              <div className="relative h-52">
                <div className="absolute inset-0 flex flex-col justify-between text-[11px] text-zinc-400">
                  <span>High</span>
                  <span>Mid</span>
                  <span>0</span>
                </div>
                <div className="absolute inset-y-0 left-8 right-0 flex items-end gap-2 border-b border-zinc-200">
                  {analytics.days.map((day, index) => {
                    const height = day.total === 0 ? 0 : Math.max(16, (day.total / max) * 100);
                    return (
                      <div key={day.label} className="flex h-full flex-1 items-end">
                        {height > 0 ? (
                          <div className="relative w-full origin-bottom rounded-t-lg bg-[#635BFF]" style={{ height: `${height}%`, animation: `barRise 700ms ease ${index * 70}ms both` }}>
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-zinc-600">{day.total >= 1000 ? `${Math.round(day.total / 1000)}k` : day.total}</span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-2 flex pl-8 text-center text-[11px] text-zinc-500">
                {analytics.days.map((day) => (
                  <span key={day.label} className="flex-1">
                    <span className="block">{day.label}</span>
                    <span className="block text-zinc-400">{day.date}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-zinc-500">No sales in the last 7 days. This month is ₦{analytics.monthSales.toLocaleString()}.</p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold">Top-selling products</h2>
          <div className="mt-4 space-y-4">
            {analytics.topProducts.length === 0 ? (
              <p className="text-sm text-zinc-500">No sales yet.</p>
            ) : (
              analytics.topProducts.map((product) => (
                <div key={product.name} className="flex items-center gap-3">
                  {product.image ? (
                    <img src={product.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635BFF]/10 text-xs font-semibold text-[#635BFF]">{product.name.slice(0, 1)}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="shrink-0 text-zinc-500">{product.quantity} sold</p>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full rounded-full bg-[#635BFF]" style={{ width: `${Math.max(8, Math.round((product.quantity / Math.max(...analytics.topProducts.map((item) => item.quantity), 1)) * 100))}%` }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

<section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold">Low stock</h2>
          <div className="mt-4 space-y-3">
            {analytics.lowStock.length === 0 ? (
              <p className="text-sm text-zinc-500">Nothing is low.</p>
            ) : (
              analytics.lowStock.map((product) => (
                <div key={product.name} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">{product.stock} left</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      <style>{`@keyframes barRise { from { transform: scaleY(0.2); opacity: 0.4; } to { transform: scaleY(1); opacity: 1; } }`}</style>
    </main>
    </>
  );
}

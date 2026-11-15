import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getAnalytics } from "@/features/analytics/queries";
import SavedStats from "@/features/analytics/components/SavedStats";

// Helper: compute a capped period-over-period % change.
// Revenue/profit: green when positive, red when negative.
// Costs: green when negative (costs fell), red when positive (costs rose).
// Caps zero-baseline spikes to 999% max to avoid "16400%" noise.
function pct(current: number, previous: number): number | null {
  if (previous === 0) {
    // No baseline — return null to avoid misleading ∞ or capped spikes
    return null;
  }
  const raw = Math.round(((current - previous) / previous) * 100);
  // Cap at ±999 for display sanity
  return Math.max(-999, Math.min(999, raw));
}

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
  const prevLeft = analytics.prevWeekSales - analytics.prevWeekCosts;
  const hasWeekSales = analytics.weekSales > 0;

  // Upgrade 4 — Real period-over-period % on all 4 cards
  // For costs: green = cost decreased (good), red = cost increased (bad)
  const weekSalesPct = pct(analytics.weekSales, analytics.prevWeekSales);
  const monthSalesPct = pct(analytics.monthSales, analytics.prevMonthSales);
  const weekCostsPct = pct(analytics.weekCosts, analytics.prevWeekCosts);
  const leftPct = pct(left, prevLeft);

  // Icon appearance config per card
  const cards = [
    {
      label: "Sales this week",
      value: analytics.weekSales,
      tone: "from-[#635BFF]/15 to-[#635BFF]/5",
      accent: "text-[#635BFF]",
      pct: weekSalesPct,
      // Revenue: ↑ = green, ↓ = red
      pctColor: (v: number) => (v >= 0 ? "text-emerald-600" : "text-rose-600"),
      pctArrow: (v: number) => (v >= 0 ? "↑" : "↓"),
      pctLabel: "vs last week",
    },
    {
      label: "Sales this month",
      value: analytics.monthSales,
      tone: "from-[#635BFF]/10 to-[#635BFF]/5",
      accent: "text-[#635BFF]",
      pct: monthSalesPct,
      pctColor: (v: number) => (v >= 0 ? "text-emerald-600" : "text-rose-600"),
      pctArrow: (v: number) => (v >= 0 ? "↑" : "↓"),
      pctLabel: "vs last month",
    },
    {
      label: "Costs this week",
      value: analytics.weekCosts,
      tone: "from-amber-100 to-amber-50",
      accent: "text-amber-700",
      pct: weekCostsPct,
      // Costs: ↑ = red (bad), ↓ = green (good)
      pctColor: (v: number) => (v <= 0 ? "text-emerald-600" : "text-rose-600"),
      pctArrow: (v: number) => (v >= 0 ? "↑" : "↓"),
      pctLabel: "vs last week",
    },
    {
      label: "Left this week",
      value: left,
      tone: left >= 0 ? "from-emerald-100 to-emerald-50" : "from-rose-100 to-rose-50",
      accent: left >= 0 ? "text-emerald-700" : "text-rose-700",
      pct: leftPct,
      pctColor: (v: number) => (v >= 0 ? "text-emerald-600" : "text-rose-600"),
      pctArrow: (v: number) => (v >= 0 ? "↑" : "↓"),
      pctLabel: "vs last week",
    },
  ];

  const bestDay = analytics.days.reduce((best, day) => day.total > best.total ? day : best, analytics.days[0] || { label: "", total: 0 });

  // Upgrade 5 — Numeric Y-axis labels (K-formatted), grid lines, tighter spacing
  // Compute 4 clean Y-axis ticks: 0, low-mid, mid, high
  const yMax = max;
  const yTicks = [
    yMax,
    Math.round(yMax * 0.66),
    Math.round(yMax * 0.33),
    0,
  ];

  function fmtK(n: number): string {
    if (n === 0) return "0";
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return String(n);
  }

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
    <main className="px-4 py-6 pb-24 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <p className="mt-1 text-sm text-zinc-500">Understand your business performance</p>
          </div>
          <label className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#635BFF]" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>
            <select defaultValue="7" className="bg-transparent text-xs font-medium outline-none">
              <option value="7">Last 7 days</option>
              <option value="30">This month</option>
            </select>
          </label>
        </div>

        {/* Upgrade 4 — 4 summary cards with real period-over-period % indicators */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {cards.map((card) => (
            <div key={card.label} className={`rounded-2xl border border-zinc-100 bg-gradient-to-br ${card.tone} p-4`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${card.accent}`}>{card.label}</p>
              <p className="mt-2 text-xl font-bold text-zinc-900">₦{Number(card.value).toLocaleString()}</p>
              {card.pct !== null ? (
                <p className={`mt-1 flex items-center gap-0.5 text-xs font-semibold ${card.pctColor(card.pct)}`}>
                  <span className="text-sm leading-none">{card.pctArrow(card.pct)}</span>
                  <span>{Math.abs(card.pct)}%</span>
                  <span className="ml-0.5 font-normal text-zinc-500">{card.pctLabel}</span>
                </p>
              ) : (
                <p className="mt-1 text-xs text-zinc-400">No prior period data</p>
              )}
            </div>
          ))}
        </div>

        {/* Upgrade 5 — Sales overview chart: #635BFF bars, grid lines, numeric K-labels */}
        <section className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Sales overview</h2>
            <span className="flex items-center gap-1 text-xs text-zinc-500"><span className="h-2 w-2 rounded-full bg-[#635BFF]" /> Sales</span>
          </div>
          {hasWeekSales ? (
            <div className="mt-4">
              {/* Chart area */}
              <div className="relative" style={{ height: "180px" }}>
                {/* Y-axis labels + horizontal grid lines */}
                {yTicks.map((tick, i) => {
                  const topPct = i === 0 ? 0 : i === 1 ? 34 : i === 2 ? 67 : 100;
                  return (
                    <div
                      key={tick}
                      className="absolute left-0 right-0 flex items-center gap-1"
                      style={{ top: `${topPct}%` }}
                    >
                      <span className="w-7 shrink-0 text-right text-[10px] leading-none text-zinc-400">{fmtK(tick)}</span>
                      {/* Horizontal grid line */}
                      <div className="flex-1 border-t border-zinc-100" />
                    </div>
                  );
                })}
                {/* Bars container — sits on top of grid */}
                <div className="absolute inset-y-0 left-8 right-0 flex items-end gap-1.5">
                  {analytics.days.map((day, index) => {
                    const height = day.total === 0 ? 0 : Math.max(14, (day.total / max) * 100);
                    return (
                      <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end">
                        {height > 0 ? (
                          <div
                            className="relative w-full origin-bottom rounded-t-md bg-[#635BFF]"
                            style={{ height: `calc(${height}% - 1px)`, animation: `barRise 600ms ease ${index * 60}ms both` }}
                          >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold text-zinc-600">
                              {fmtK(day.total)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* X-axis day labels */}
              <div className="mt-1.5 flex pl-8 text-center text-[10px] text-zinc-500">
                {analytics.days.map((day) => (
                  <span key={day.label} className="flex-1">
                    <span className="block font-medium">{day.label}</span>
                    <span className="block text-zinc-400">{day.date}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">No sales in the last 7 days. This month is ₦{analytics.monthSales.toLocaleString()}.</p>
          )}
        </section>

        {/* Top-selling products — immediately visible after compact chart */}
        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Top-selling products</h2>
            <a href="/sales" className="text-sm font-medium text-[#635BFF]">View all →</a>
          </div>
          <div className="mt-3 space-y-4">
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
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full rounded-full bg-[#635BFF]" style={{ width: `${Math.max(8, Math.round((product.quantity / Math.max(...analytics.topProducts.map((item) => item.quantity), 1)) * 100))}%` }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-4 rounded-2xl bg-[#635BFF]/10 p-4">
          <p className="font-semibold">Recent insights</p>
          <p className="mt-1 text-sm text-zinc-600">{bestDay.total > 0 ? `Your strongest day this week is ${bestDay.label}, with ₦${bestDay.total.toLocaleString()} in sales.` : "Record a few sales and the strongest day will show here."}</p>
        </section>

        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="font-semibold">Low stock</h2>
          <div className="mt-3 space-y-3">
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
      <style>{`@keyframes barRise { from { transform: scaleY(0.15); opacity: 0.3; } to { transform: scaleY(1); opacity: 1; } }`}</style>
    </main>
    </>
  );
}

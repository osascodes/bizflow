import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getAnalytics } from "@/features/analytics/queries";
import SavedStats from "@/features/analytics/components/SavedStats";
import SalesOverview from "@/features/analytics/components/SalesOverview";
import { BarChart2, Coins, Trophy, Wallet } from "lucide-react";

// Helper: compute a capped period-over-period % change.
// Revenue/profit: green when positive, red when negative.
// Costs: green when negative (costs fell), red when positive (costs rose).
// Caps zero-baseline spikes cleanly.
function pct(current: number, previous: number): number | null {
  if (previous === 0) {
    return null;
  }
  const raw = Math.round(((current - previous) / previous) * 100);
  return Math.max(-999, Math.min(999, raw));
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
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

  const params = await searchParams;
  const analytics = await getAnalytics(params.from, params.to);
  const left = analytics.netProfit;
  const prevLeft = analytics.prevNetProfit;

  // Upgrade 4 — Real period-over-period % on all 4 cards
  // For costs: green = cost decreased (good), red = cost increased (bad)
  const weekSalesPct = pct(analytics.weekSales, analytics.prevWeekSales);
  const monthSalesPct = pct(analytics.monthSales, analytics.prevMonthSales);
  const weekCostsPct = pct(analytics.weekCosts, analytics.prevWeekCosts);
  const leftPct = pct(left, prevLeft);

  // Appearance config per card (Natural case title, matching icons from mockup 1)
  const cards = [
    {
      label: "Sales This Week",
      value: analytics.weekSales,
      tone: "from-[#635BFF]/15 to-[#635BFF]/5",
      accent: "text-[#635BFF]",
      Icon: BarChart2,
      pct: weekSalesPct,
      pctColor: (v: number) => (v >= 0 ? "text-emerald-600" : "text-rose-600"),
      pctArrow: (v: number) => (v >= 0 ? "↑" : "↓"),
    },
    {
      label: "Sales This Month",
      value: analytics.monthSales,
      tone: "from-[#635BFF]/10 to-[#635BFF]/5",
      accent: "text-[#635BFF]",
      Icon: Wallet,
      pct: monthSalesPct,
      pctColor: (v: number) => (v >= 0 ? "text-emerald-600" : "text-rose-600"),
      pctArrow: (v: number) => (v >= 0 ? "↑" : "↓"),
    },
    {
      label: "Expenses This Week",
      value: analytics.weekCosts,
      tone: "from-amber-100 to-amber-50",
      accent: "text-amber-600",
      Icon: Coins,
      pct: weekCostsPct,
      pctColor: (v: number) => (v <= 0 ? "text-emerald-600" : "text-rose-600"),
      pctArrow: (v: number) => (v >= 0 ? "↑" : "↓"),
    },
    {
      label: "Net Profit This Week",
      value: left,
      tone: left >= 0 ? "from-emerald-100 to-emerald-50" : "from-rose-100 to-rose-50",
      accent: left >= 0 ? "text-emerald-600" : "text-rose-600",
      Icon: Trophy,
      pct: leftPct,
      pctColor: (v: number) => (v >= 0 ? "text-emerald-600" : "text-rose-600"),
      pctArrow: (v: number) => (v >= 0 ? "↑" : "↓"),
    },
  ];

  const bestDay = analytics.days.reduce((best, day) => day.total > best.total ? day : best, analytics.days[0] || { label: "", total: 0 });

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

        </div>

        {/* Upgrade 4 — 4 summary cards with real period-over-period % indicators (natural case, matching mockup 1) */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {cards.map((card) => {
            const Icon = card.Icon;
            return (
              <div key={card.label} className={`rounded-2xl border border-zinc-100 bg-gradient-to-br ${card.tone} p-4`}>
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-4 w-4 ${card.accent}`} />
                  <p className="text-xs font-medium text-zinc-600">{card.label}</p>
                </div>
                <p className="mt-2 text-xl font-bold text-zinc-900">₦{Number(card.value).toLocaleString()}</p>
                {card.label === "Net Profit This Week" && analytics.missingCostUnits > 0 ? (
                  <p className="mt-1.5 text-xs font-medium text-amber-700">⚠ {analytics.missingCostUnits === 1 ? "1 item missing cost" : `${analytics.missingCostUnits} items missing cost`}</p>
                ) : card.pct !== null ? (
                  <p className={`mt-1.5 flex items-center gap-0.5 text-xs font-semibold ${card.pctColor(card.pct)}`}>
                    <span className="text-sm leading-none">{card.pctArrow(card.pct)}</span>
                    <span>{Math.abs(card.pct)}%</span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-zinc-400">No prior data</p>
                )}
              </div>
            );
          })}
        </div>

        <SalesOverview days={analytics.chartDays} from={analytics.chartFrom} to={analytics.chartTo} />

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

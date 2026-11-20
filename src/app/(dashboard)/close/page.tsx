import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getDayClose } from "@/features/sales/queries";
import PrintButton from "@/features/sales/components/PrintButton";

function money(value: number) {
  return `₦${Number(value).toLocaleString()}`;
}

export default async function ClosePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  if (business.role !== "owner") redirect("/dashboard");

  const params = await searchParams;
  const selected = params.date ? new Date(`${params.date}T12:00:00`) : new Date();
  const day = Number.isNaN(selected.getTime()) ? new Date() : selected;
  const close = await getDayClose(day);
  if (!close) redirect("/onboarding");

  const dateValue = day.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
  const dateLabel = day.toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const empty = close.salesCount === 0 && close.expenses === 0 && close.debtPayments === 0;
  const lines = [
    close.shop,
    `Close of day · ${dateLabel}`,
    `Sales: ${money(close.salesTotal)} (${close.salesCount} sale${close.salesCount === 1 ? "" : "s"})`,
    `Collected on sales: ${money(close.collectedOnSales)}`,
    `Debt payments received: ${money(close.debtPayments)}`,
    `Total collected: ${money(close.collected)}`,
    `Expenses: ${money(close.expenses)}`,
    `Outstanding from today's sales: ${money(close.outstanding)}`,
  ];

  return (
    <main className="px-4 py-8 pb-28 md:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold text-zinc-950">Close of day</h1>
        <p className="mt-2 text-sm text-zinc-500">Review the day. This does not lock sales or expenses.</p>
        <form className="mt-5 flex items-center gap-2">
          <input type="date" name="date" defaultValue={dateValue} className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950" />
          <button className="h-11 rounded-xl bg-[#635BFF] px-4 text-sm font-semibold text-white">View</button>
        </form>

        {empty ? (
          <div className="mt-5 rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-500">No sales, payments, or expenses on this day.</div>
        ) : null}

        <section className="mt-5 rounded-2xl border border-zinc-100 bg-[#F4F4F9] p-4">
          <p className="text-sm text-zinc-500">Daily sales</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">{money(close.salesTotal)}</p>
          <p className="mt-1 text-sm text-zinc-500">{close.salesCount} transaction{close.salesCount === 1 ? "" : "s"}</p>
        </section>

        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="font-semibold">Money received</h2>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-3"><span className="text-zinc-500">Paid on today's sales</span><span className="font-semibold">{money(close.collectedOnSales)}</span></div>
            <div className="flex justify-between gap-3"><span className="text-zinc-500">Debt payments received</span><span className="font-semibold">{money(close.debtPayments)}</span></div>
            <div className="flex justify-between gap-3 border-t border-zinc-100 pt-3"><span className="text-zinc-950">Total collected</span><span className="font-semibold text-[#635BFF]">{money(close.collected)}</span></div>
          </div>
          <p className="mt-3 text-xs text-zinc-500">Unpaid credit is not counted as collected. Brinset does not split cash and bank yet.</p>
        </section>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-zinc-100 bg-[#F4F4F9] p-4">
            <p className="text-sm text-zinc-500">Expenses</p>
            <p className="mt-2 text-xl font-semibold text-zinc-950">{money(close.expenses)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-100 bg-[#F4F4F9] p-4">
            <p className="text-sm text-zinc-500">Outstanding</p>
            <p className="mt-2 text-xl font-semibold text-zinc-950">{money(close.outstanding)}</p>
            <p className="mt-1 text-xs text-zinc-500">From today's sales</p>
          </div>
        </div>

        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="font-semibold">Daily report · {dateLabel}</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><span>Sales</span><span className="font-semibold">{money(close.salesTotal)}</span></div>
            <div className="flex justify-between gap-3"><span>Collected</span><span className="font-semibold">{money(close.collected)}</span></div>
            <div className="flex justify-between gap-3"><span>Expenses</span><span className="font-semibold">{money(close.expenses)}</span></div>
            <div className="flex justify-between gap-3"><span>Still owed from today</span><span className="font-semibold">{money(close.outstanding)}</span></div>
          </div>
        </section>

        <div className="mt-5 flex gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`} target="_blank" className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#635BFF] text-sm font-semibold text-white">Share on WhatsApp</a>
          <PrintButton />
        </div>
      </div>
    </main>
  );
}

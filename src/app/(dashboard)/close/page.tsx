import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getDayClose } from "@/features/sales/queries";

function money(value: number) {
  return `₦${Number(value).toLocaleString()}`;
}

export default async function ClosePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  if (business.role !== "owner") redirect("/dashboard");

  const params = await searchParams;
  const selected = params.date ? new Date(`${params.date}T12:00:00`) : new Date();
  const valid = !Number.isNaN(selected.getTime());
  const day = valid ? selected : new Date();
  const close = await getDayClose(day);
  if (!close) redirect("/onboarding");

  const dateValue = day.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
  const dateLabel = day.toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", weekday: "short", day: "numeric", month: "short" });
  const missing = close.missingUnits === 1 ? "1 item missing cost" : close.missingUnits > 1 ? `${close.missingUnits} items missing cost` : "";
  const lines = [
    close.shop,
    `Close of day · ${dateLabel}`,
    `Sales: ${money(close.revenue)} (${close.salesCount})`,
    `Product cost: ${money(close.cogs)}`,
    `Expenses: ${money(close.expenses)}`,
    `Net profit: ${money(close.net)}${missing ? ` · ${missing}` : ""}`,
    "",
    "Top products",
    ...(close.top.length ? close.top.map((item) => `${item.quantity}x ${item.name} · ${money(item.amount)}`) : ["None"]),
  ];

  return (
    <main className="px-4 py-8 pb-28 md:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold text-zinc-950">Close of day</h1>
        <p className="mt-2 text-sm text-zinc-500">Today’s sales, product cost, expenses, and net profit.</p>
        <form className="mt-5">
          <input type="date" name="date" defaultValue={dateValue} className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950" />
          <button className="ml-2 h-11 rounded-xl bg-[#635BFF] px-4 text-sm font-semibold text-white">View</button>
        </form>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            ["Sales", money(close.revenue)],
            ["Product cost", money(close.cogs)],
            ["Expenses", money(close.expenses)],
            ["Net profit", money(close.net)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-zinc-100 bg-[#F4F4F9] p-4">
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="mt-2 text-xl font-semibold text-zinc-950">{value}</p>
            </div>
          ))}
        </div>
        {missing ? <p className="mt-3 text-xs font-medium text-amber-700">⚠ {missing}. Profit is partial.</p> : null}
        <p className="mt-3 text-sm text-zinc-500">{close.salesCount} sale{close.salesCount === 1 ? "" : "s"} · {dateLabel}</p>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="font-semibold">Top products</h2>
          <div className="mt-3 space-y-3">
            {close.top.length === 0 ? (
              <p className="text-sm text-zinc-500">No sales on this day.</p>
            ) : close.top.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3">
                <p className="text-sm text-zinc-950">{item.quantity}x {item.name}</p>
                <p className="text-sm font-semibold text-zinc-950">{money(item.amount)}</p>
              </div>
            ))}
          </div>
        </section>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`}
          target="_blank"
          className="mt-5 flex h-12 items-center justify-center rounded-xl bg-[#635BFF] text-sm font-semibold text-white"
        >
          Share on WhatsApp
        </a>
      </div>
    </main>
  );
}

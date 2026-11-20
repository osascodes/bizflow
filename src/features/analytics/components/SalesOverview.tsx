"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ChartDay = { key: string; label: string; date: number; total: number };

function formatMoneyShort(value: number) {
  const amount = Math.abs(Number(value) || 0);
  const sign = value < 0 ? "-" : "";
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const text = millions >= 10 ? millions.toFixed(1) : millions.toFixed(2);
    return `${sign}₦${text.replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1")}m`;
  }
  if (amount >= 1000) {
    const thousands = amount / 1000;
    const text = thousands >= 100 ? String(Math.round(thousands)) : thousands.toFixed(1);
    return `${sign}₦${text.replace(/\.0$/, "")}k`;
  }
  return `${sign}₦${Math.round(amount)}`;
}

function niceScale(max: number) {
  if (max <= 0) return { max: 1000, ticks: [1000, 500, 0] };
  const rawStep = max / 3;
  const exponent = Math.floor(Math.log10(rawStep));
  const magnitude = 10 ** exponent;
  const residual = rawStep / magnitude;
  const step = (residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10) * magnitude;
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let value = top; value >= 0; value -= step) ticks.push(Math.round(value));
  return { max: top || step, ticks };
}

function formatRange(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const same = from === to;
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (same) return start.toLocaleDateString("en-NG", { ...opts, year: "numeric" });
  const startText = start.toLocaleDateString("en-NG", opts);
  const endText = end.toLocaleDateString("en-NG", { ...opts, year: "numeric" });
  return `${startText} – ${endText}`;
}

function monthDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const startOffset = first.getDay();
  const count = new Date(year, monthIndex + 1, 0).getDate();
  return { year, monthIndex, startOffset, count };
}

function iso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function SalesOverview({ days, from, to }: { days: ChartDay[]; from: string; to: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(from);
  const [draftEnd, setDraftEnd] = useState(to);
  const [month, setMonth] = useState(() => new Date(`${to || from}T00:00:00`));
  const scale = useMemo(() => niceScale(Math.max(...days.map((day) => day.total), 0)), [days]);
  const hasSales = days.some((day) => day.total > 0);
  const calendar = monthDays(month);
  const today = iso(new Date());

  function pick(date: string) {
    if (date > today) return;
    if (!draftStart || (draftStart && draftEnd && draftStart !== draftEnd)) {
      setDraftStart(date);
      setDraftEnd(date);
      return;
    }
    if (date < draftStart) {
      setDraftEnd(draftStart);
      setDraftStart(date);
      return;
    }
    setDraftEnd(date);
  }

  function apply() {
    const start = draftStart <= draftEnd ? draftStart : draftEnd;
    const end = draftStart <= draftEnd ? draftEnd : draftStart;
    setOpen(false);
    router.push(`/analytics?from=${start}&to=${end}`);
  }

  const cells = [
    ...Array.from({ length: calendar.startOffset }, () => null),
    ...Array.from({ length: calendar.count }, (_, index) => index + 1),
  ];

  return (
    <section className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Sales overview</h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#635BFF]" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>
            {formatRange(from, to)}
          </button>
          {open ? (
            <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="h-8 w-8 rounded-lg text-zinc-500">‹</button>
                <p className="text-sm font-semibold">{month.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}</p>
                <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="h-8 w-8 rounded-lg text-zinc-500">›</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-zinc-400">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((day, index) => {
                  if (!day) return <span key={`empty-${index}`} />;
                  const date = iso(new Date(calendar.year, calendar.monthIndex, day));
                  const selected = date >= draftStart && date <= draftEnd;
                  const edge = date === draftStart || date === draftEnd;
                  const disabled = date > today;
                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={disabled}
                      onClick={() => pick(date)}
                      className={`h-8 rounded-lg text-xs ${edge ? "bg-[#635BFF] font-semibold text-white" : selected ? "bg-[#635BFF]/10 text-[#635BFF]" : "text-zinc-700"} disabled:text-zinc-300`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={apply} className="mt-3 h-10 w-full rounded-xl bg-[#635BFF] text-sm font-semibold text-white">Apply</button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-4">
        <div className="relative" style={{ height: "180px" }}>
          {scale.ticks.map((tick) => (
            <div key={tick} className="absolute left-0 right-0 flex items-center gap-1" style={{ top: `${((scale.max - tick) / scale.max) * 100}%` }}>
              <span className="w-12 shrink-0 text-right text-[10px] leading-none text-zinc-400">{formatMoneyShort(tick)}</span>
              <div className="flex-1 border-t border-zinc-100" />
            </div>
          ))}
          <div className="absolute inset-y-0 left-14 right-0 flex items-end gap-1">
            {days.map((day, index) => {
              const height = day.total === 0 ? 0 : Math.max(8, (day.total / scale.max) * 100);
              return (
                <div key={day.key} className="flex h-full min-w-0 flex-1 flex-col items-end justify-end">
                  <div
                    className={`relative w-full origin-bottom rounded-t-md ${height > 0 ? "bg-[#635BFF]" : "bg-zinc-200"}`}
                    style={{ height: height > 0 ? `calc(${height}% - 1px)` : "2px", animation: `barRise 600ms ease ${index * 40}ms both` }}
                  >
                    {height > 0 && days.length <= 7 ? (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold text-zinc-600">{formatMoneyShort(day.total)}</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-1.5 flex pl-14 text-center text-[10px] text-zinc-500">
          {days.map((day, index) => {
            const show = days.length <= 10 || index % Math.ceil(days.length / 7) === 0 || index === days.length - 1;
            return (
              <span key={day.key} className="min-w-0 flex-1">
                {show ? (
                  <>
                    {days.length <= 10 ? <span className="block font-medium">{day.label}</span> : null}
                    <span className="block text-zinc-400">{day.date}</span>
                  </>
                ) : null}
              </span>
            );
          })}
        </div>
      </div>
      {hasSales ? null : <p className="mt-3 text-xs text-zinc-500">No sales recorded yet. Your sales activity will appear here.</p>}
    </section>
  );
}

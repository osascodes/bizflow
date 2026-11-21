"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

type ChartDay = { key: string; label: string; date: number; total: number };

const OPTIONS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "custom", label: "Custom date range" },
];

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
  if (from === to) return start.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  return `${start.toLocaleDateString("en-NG", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`;
}

export default function SalesOverview({ days, from, to, range }: { days: ChartDay[]; from: string; to: string; range: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [activeRange, setActiveRange] = useState(range);
  const [step, setStep] = useState<"start" | "end" | null>(null);
  const [draftStart, setDraftStart] = useState(from);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const scale = useMemo(() => niceScale(Math.max(...days.map((day) => day.total), 0)), [days]);
  const hasSales = days.some((day) => day.total > 0);
  const label = activeRange === "custom" ? formatRange(from, to) : OPTIONS.find((option) => option.id === activeRange)?.label || "Last 7 days";

  useEffect(() => {
    if (!open) return;
    OPTIONS.forEach((option) => {
      if (option.id !== "custom") router.prefetch(`/analytics?range=${option.id}`);
    });
  }, [open, router]);

  function openPicker(input: HTMLInputElement | null) {
    if (!input) return;
    input.focus({ preventScroll: true });
    if (typeof input.showPicker === "function") input.showPicker();
  }

  function choose(id: string) {
    if (id === "custom") {
      setOpen(false);
      setStep("start");
      openPicker(startRef.current);
      return;
    }
    setActiveRange(id);
    setOpen(false);
    startTransition(() => {
      router.replace(`/analytics?range=${id}`, { scroll: false });
    });
  }

  function apply(start: string, end: string) {
    if (!start || !end) return;
    const fromDate = start <= end ? start : end;
    const toDate = start <= end ? end : start;
    setStep(null);
    setActiveRange("custom");
    startTransition(() => {
      router.replace(`/analytics?range=custom&from=${fromDate}&to=${toDate}`, { scroll: false });
    });
  }

  return (
    <section className="relative mt-5 w-full min-w-0 overflow-visible rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Sales overview</h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-9 max-w-[8.5rem] items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 text-xs font-medium text-[#635BFF]"
          >
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
          {open ? (
            <div
              className="absolute right-0 top-11 z-40 max-h-56 w-52 max-w-[calc(100vw-2.5rem)] touch-pan-y overflow-y-auto overscroll-contain rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg"
              onTouchMove={(event) => event.stopPropagation()}
            >
              {OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => choose(option.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${option.id === activeRange ? "bg-[#635BFF]/10 font-semibold text-[#635BFF]" : "text-zinc-700"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
          <label className="sr-only">
            Start date
            <input
              ref={startRef}
              type="date"
              value={from}
              onChange={(event) => {
                const value = event.target.value;
                if (!value) return;
                setDraftStart(value);
                setStep("end");
                openPicker(endRef.current);
              }}
              className="fixed left-1/2 top-24 h-9 w-40 -translate-x-1/2 opacity-0"
            />
          </label>
          <label className="sr-only">
            End date
            <input
              ref={endRef}
              type="date"
              value={to}
              onChange={(event) => {
                const value = event.target.value;
                if (!value) return;
                apply(draftStart, value);
              }}
              className="fixed left-1/2 top-24 h-9 w-40 -translate-x-1/2 opacity-0"
            />
          </label>
        </div>
      </div>
      <div className={`mt-4 min-w-0 overflow-hidden ${isPending ? "opacity-60" : ""}`}>
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
                      <span className="absolute -top-5 left-1/2 max-w-[4.2rem] -translate-x-1/2 truncate text-[9px] font-semibold text-zinc-600">{formatMoneyShort(day.total)}</span>
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

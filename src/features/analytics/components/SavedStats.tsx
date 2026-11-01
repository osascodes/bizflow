"use client";

import { useEffect, useState } from "react";

type Day = { label: string; total: number };
type Product = { name: string; quantity?: number; amount?: number; stock?: number };
type Snapshot = {
  name: string;
  weekSales: number;
  monthSales: number;
  weekCosts: number;
  days: Day[];
  topProducts: Product[];
  lowStock: Product[];
};

const KEY = "bizflow-stats";

export default function SavedStats({ snapshot, offline = false }: { snapshot?: Snapshot | null; offline?: boolean }) {
  const [saved, setSaved] = useState<Snapshot | null>(snapshot || null);

  useEffect(() => {
    if (snapshot) {
      localStorage.setItem(KEY, JSON.stringify(snapshot));
      setSaved(snapshot);
      return;
    }
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    try {
      setSaved(JSON.parse(raw) as Snapshot);
    } catch {
      setSaved(null);
    }
  }, [snapshot]);

  if (snapshot && !offline) return null;
  if (!saved) {
    return (
      <main className="px-4 py-8 md:px-8">
        <h1 className="text-2xl font-semibold text-white">Stats</h1>
        <p className="mt-2 text-sm text-zinc-500">Open Stats once while online.</p>
      </main>
    );
  }

  const left = saved.weekSales - saved.weekCosts;
  const max = Math.max(...saved.days.map((day) => day.total), 1);
  const cards = [
    ["This week", saved.weekSales],
    ["This month", saved.monthSales],
    ["Costs this week", saved.weekCosts],
    ["Left this week", left],
  ];

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-violet-300">{saved.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Stats</h1>
        {offline ? <p className="mt-2 text-xs text-amber-300">Last saved numbers</p> : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value]) => (
            <div key={String(label)} className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">N{Number(value).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <section className="mt-6 rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="font-semibold text-white">Last 7 days</h2>
          <div className="mt-8 flex h-56 items-end gap-3">
            {saved.days.map((day) => {
              const height = day.total === 0 ? 0 : Math.max(22, (day.total / max) * 100);
              return (
                <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                  <p className="text-[11px] text-zinc-500">{day.total === 0 ? "0" : `N${day.total.toLocaleString()}`}</p>
                  <div className="flex h-40 w-full items-end border-b border-white/10">
                    {height > 0 ? <div className="w-full rounded-t-xl bg-gradient-to-t from-[#7e22ce] to-[#d946ef]" style={{ height: `${height}%` }} /> : null}
                  </div>
                  <p className="text-xs text-zinc-400">{day.label}</p>
                </div>
              );
            })}
          </div>
        </section>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="font-semibold text-white">Top products this month</h2>
            <div className="mt-4 space-y-3">
              {saved.topProducts.length === 0 ? <p className="text-sm text-zinc-500">No sales yet.</p> : saved.topProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between text-sm">
                  <span className="text-white">{product.name}</span>
                  <span className="text-zinc-400">{product.quantity} sold</span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="font-semibold text-white">Low stock</h2>
            <div className="mt-4 space-y-3">
              {saved.lowStock.length === 0 ? <p className="text-sm text-zinc-500">Nothing is low.</p> : saved.lowStock.map((product) => (
                <div key={product.name} className="flex items-center justify-between text-sm">
                  <span className="text-white">{product.name}</span>
                  <span className="text-amber-200">{product.stock} left</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

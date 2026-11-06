"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Need = { id: string; title: string; detail: string; status: string };
type Low = { id: string; name: string; stock: number };
type Owed = { id: string; name: string; left: number };
type Today = { id: string; total: number; items: string };
type Snapshot = {
  category: string;
  name: string;
  welcome: string;
  role: string;
  stats: [string, string][];
  needs?: Need[];
  low?: Low[];
  owed?: Owed[];
  today?: Today[];
};

const KEY = "bizflow-home";

export default function SavedHome({
  snapshot,
  offline = false,
}: {
  snapshot?: Snapshot | null;
  offline?: boolean;
}) {
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

  if (!saved) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-xl font-semibold text-white">You are offline</h1>
          <p className="mt-2 text-sm text-zinc-400">Open Home once while online. After that, the last numbers stay here.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-violet-300">{saved.category}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{saved.name}</h1>
        <p className="mt-2 text-sm text-zinc-400">{saved.welcome}</p>
        <p className="mt-1 text-sm text-violet-300">Role: {saved.role}</p>
        {offline ? <p className="mt-3 text-xs text-amber-300">Last saved numbers</p> : null}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {saved.stats.map(([label, value]) => {
            const href = label === "Orders to do" ? "/storefront" : label === "Low stock" ? "/inventory?focus=low" : label === "Debts due" ? "/debts" : label === "Sales today" ? "/sales" : label === "Costs today" ? "/expenses" : "";
            const card = (
              <>
                <p className="text-sm text-zinc-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </>
            );
            return href ? (
              <Link key={label} href={href} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                {card}
              </Link>
            ) : (
              <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                {card}
              </div>
            );
          })}
        </div>
        {saved.needs && saved.needs.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white">Needs you</h2>
            <div className="mt-3 space-y-3">
              {saved.needs.map((item) => (
                <Link key={item.id} href="/storefront" className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-zinc-400">{item.detail}</p>
                      <p className="mt-1 text-xs capitalize text-violet-300">{item.status}</p>
                    </div>
                    <span className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-950">Open</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        {saved.low && saved.low.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white">Low stock</h2>
            <div className="mt-3 space-y-3">
              {saved.low.map((item) => (
                <Link key={item.id} href="/inventory?focus=low" className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-sm text-amber-300">{item.stock} left</p>
                  </div>
                  <span className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-950">Open</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        {saved.owed && saved.owed.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white">Who owes</h2>
            <div className="mt-3 space-y-3">
              {saved.owed.map((item) => (
                <Link key={item.id} href="/debts" className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-sm text-amber-300">₦{item.left.toLocaleString()} left</p>
                  </div>
                  <span className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-950">Open</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        {saved.today && saved.today.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white">Sales today</h2>
            <div className="mt-3 space-y-3">
              {saved.today.map((item) => (
                <Link key={item.id} href={`/sales/${item.id}`} className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div>
                    <p className="font-semibold text-white">{item.items}</p>
                    <p className="mt-1 text-sm text-zinc-400">₦{item.total.toLocaleString()}</p>
                  </div>
                  <span className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-950">Open</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

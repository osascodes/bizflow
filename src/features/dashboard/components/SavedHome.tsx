"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Receipt, ShoppingBag, Store, TrendingDown, TrendingUp, Wallet } from "lucide-react";

type Need = { id: string; title: string; detail: string; status: string };
type Low = { id: string; name: string; stock: number };
type Owed = { id: string; name: string; left: number };
type Today = { id: string; total: number; items: string };
type Cost = { id: string; title: string; amount: number };
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
  costs?: Cost[];
};

const KEY = "bizflow-home";

const tones: Record<string, { wrap: string; icon: string; Icon: typeof Receipt }> = {
  "Sales today": { wrap: "bg-[#635BFF]/10", icon: "text-[#635BFF]", Icon: Receipt },
  "Costs today": { wrap: "bg-amber-100", icon: "text-amber-600", Icon: Wallet },
  "Left today": { wrap: "bg-emerald-100", icon: "text-emerald-600", Icon: TrendingUp },
  "Debts due": { wrap: "bg-[#635BFF]/10", icon: "text-[#635BFF]", Icon: ShoppingBag },
  "Low stock": { wrap: "bg-rose-100", icon: "text-rose-600", Icon: Box },
  "Orders to do": { wrap: "bg-[#635BFF]/10", icon: "text-[#635BFF]", Icon: Store },
};

function hrefFor(label: string) {
  if (label === "Orders to do") return "/storefront";
  if (label === "Low stock") return "/inventory?focus=low";
  if (label === "Debts due") return "/debts";
  if (label === "Sales today") return "/sales?today=1";
  if (label === "Costs today") return "/expenses?today=1";
  return "";
}

export default function SavedHome({ snapshot, offline = false }: { snapshot?: Snapshot | null; offline?: boolean }) {
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
      <main className="px-4 py-8 pb-28 md:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-6">
          <h1 className="text-xl font-semibold">You are offline</h1>
          <p className="mt-2 text-sm text-zinc-600">Open Home once while online. After that, the last numbers stay here.</p>
        </div>
      </main>
    );
  }

  const share = () => {
    const lines = [saved.name, "Today", ...saved.stats.map(([label, value]) => `${label}: ${value}`)];
    if (saved.needs?.length) lines.push("", "Orders", ...saved.needs.map((item) => `${item.title}: ${item.detail}`));
    if (saved.low?.length) lines.push("", "Low stock", ...saved.low.map((item) => `${item.name}: ${item.stock} left`));
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  };

  return (
    <main className="px-4 py-6 pb-28 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-zinc-500">{saved.welcome}</p>
        <h1 className="mt-1 text-2xl font-semibold">{saved.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">{saved.category} · {saved.role}</p>
        {offline ? <p className="mt-2 text-xs text-amber-600">Last saved numbers</p> : null}

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={share} className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#635BFF] px-4 text-sm font-semibold text-white">
            Share summary
          </button>
          <Link href="/storefront" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold">
            <Store className="h-4 w-4 text-[#635BFF]" /> Open store
          </Link>
        </div>

        <div className="mt-7 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Business overview</h2>
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">Today</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {saved.stats.map(([label, value]) => {
            const tone = tones[label] || tones["Sales today"];
            const Icon = tone.Icon;
            const href = hrefFor(label);
            const body = (
              <>
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone.icon} bg-white/70`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-zinc-600">{label}</p>
                </div>
                <p className="mt-3 text-2xl font-semibold">{value}</p>
              </>
            );
            const klass = `rounded-3xl border border-white/70 ${tone.wrap} p-4`;
            return href ? (
              <Link key={label} href={href} className={klass}>{body}</Link>
            ) : (
              <div key={label} className={klass}>{body}</div>
            );
          })}
        </div>

        {saved.needs && saved.needs.length > 0 ? (
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Needs you</h2>
              <Link href="/storefront" className="text-sm font-medium text-[#635BFF]">View all</Link>
            </div>
            <div className="mt-3 space-y-2">
              {saved.needs.map((item) => (
                <Link key={item.id} href="/storefront" className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">{item.detail}</p>
                  </div>
                  <span className="rounded-full bg-[#635BFF]/10 px-2 py-1 text-xs font-medium text-[#635BFF]">{item.status}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {saved.low && saved.low.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Low stock</h2>
            <div className="mt-3 space-y-2">
              {saved.low.map((item) => (
                <Link key={item.id} href="/inventory?focus=low" className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="font-medium">{item.name}</p>
                  <span className="text-sm font-medium text-rose-600">{item.stock} left</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

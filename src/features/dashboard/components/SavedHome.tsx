"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Box, LogOut, Receipt, ShoppingBag, Store, TrendingUp, User, Wallet } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";

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
  logoUrl?: string;
  email?: string;
  stats: [string, string][];
  needs?: Need[];
  low?: Low[];
  owed?: Owed[];
  today?: Today[];
  costs?: Cost[];
};

const KEY = "brinset-home";

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
  const [menu, setMenu] = useState(false);

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
        <div className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
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

  const activity = [
    ...(saved.today || []).slice(0, 3).map((sale) => ({
      id: sale.id,
      title: "New sale",
      detail: sale.items || "Sale recorded",
      amount: `+₦${sale.total.toLocaleString()}`,
      tone: "text-emerald-600",
      Icon: Receipt,
      iconWrap: "bg-emerald-100 text-emerald-600",
    })),
    ...(saved.costs || []).slice(0, 2).map((cost) => ({
      id: cost.id,
      title: "Expense added",
      detail: cost.title,
      amount: `-₦${cost.amount.toLocaleString()}`,
      tone: "text-zinc-700",
      Icon: Wallet,
      iconWrap: "bg-[#635BFF]/10 text-[#635BFF]",
    })),
    ...(saved.needs || []).slice(0, 2).map((order) => ({
      id: order.id,
      title: "New order",
      detail: order.title,
      amount: order.status,
      tone: "text-[#635BFF]",
      Icon: ShoppingBag,
      iconWrap: "bg-[#635BFF]/10 text-[#635BFF]",
    })),
  ].slice(0, 4);

  return (
    <main className="px-4 py-5 pb-28 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {saved.logoUrl ? (
              <img src={saved.logoUrl} alt="" className="h-11 w-11 rounded-2xl object-cover" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#635BFF] text-lg font-semibold text-white">{(saved.name || "B").slice(0, 1).toUpperCase()}</span>
            )}
            <div>
              <h1 className="text-lg font-semibold">{saved.name}</h1>
              <p className="text-sm text-zinc-500">{saved.category} · {saved.welcome.replace("Welcome, ", "")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <Bell className="h-5 w-5 text-zinc-700" />
              {(saved.needs?.length || 0) > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" /> : null}
            </Link>
            <button type="button" onClick={() => setMenu((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200" aria-label="Account">
              <User className="h-5 w-5 text-zinc-700" />
            </button>
          </div>
        </div>
        {menu ? (
          <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg">
            <p className="text-sm font-semibold">{saved.name}</p>
            <p className="mt-1 text-sm text-zinc-500">{saved.email || saved.welcome.replace("Welcome, ", "")}</p>
            <Link href="/forgot-password" className="mt-3 block rounded-xl px-3 py-2 text-sm font-medium text-zinc-700">Change password</Link>
            <form action={logoutAction} className="mt-1">
              <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </form>
          </div>
        ) : null}
        {offline ? <p className="mt-2 text-xs text-amber-600">Last saved numbers</p> : null}

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={share} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#635BFF] px-4 text-sm font-semibold text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white"><path d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l5.9-1.1A11 11 0 0 0 20.5 3.5zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.5.7.7-3.4-.2-.3A9.1 9.1 0 1 1 12 20.5zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.7 11.5 11.5 0 0 0 4.4 3.9 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z"/></svg>
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
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 ${tone.icon}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-zinc-600">{label}</p>
                </div>
                <p className="mt-3 text-2xl font-semibold">{value}</p>
              </>
            );
            const klass = `rounded-2xl ${tone.wrap} p-4`;
            return href ? <Link key={label} href={href} className={klass}>{body}</Link> : <div key={label} className={klass}>{body}</div>;
          })}
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <Link href="/activity" className="text-sm font-medium text-[#635BFF]">View all</Link>
          </div>
          <div className="mt-3 space-y-2">
            {activity.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">No sales, costs, or orders yet today.</div>
            ) : activity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${item.iconWrap}`}>
                  <item.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="truncate text-sm text-zinc-500">{item.detail}</p>
                </div>
                <p className={`text-sm font-semibold ${item.tone}`}>{item.amount}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banknote, Bell, Box, Calendar, ChevronRight, ClipboardList, Lock, LogOut, Receipt, ShoppingBag, ShoppingCart, Store, TrendingUp, User, Wallet, X } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";

type Need = { id: string; title: string; detail: string; status: string; createdAt?: string; number?: string };
type Low = { id: string; name: string; stock: number };
type Owed = { id: string; name: string; left: number };
type Today = { id: string; total: number; items: string; createdAt?: string };
type Cost = { id: string; title: string; amount: number; createdAt?: string };
type DebtEvent = { id: string; name: string; amount: number; createdAt: string };
type Snapshot = {
  category: string;
  name: string;
  welcome: string;
  role: string;
  logoUrl?: string;
  avatarUrl?: string;
  email?: string;
  dateValue?: string;
  dateLabel?: string;
  stats: [string, string, string?][];
  needs?: Need[];
  low?: Low[];
  owed?: Owed[];
  today?: Today[];
  costs?: Cost[];
  debts?: DebtEvent[];
  payments?: DebtEvent[];
};

const KEY = "brinset-home";

// Upgrade 1 — Uniform soft lavender-gray (#F4F4F9) background with crisp #635BFF icons on all 6 KPI cards
function getTone(label: string): { wrap: string; icon: string; Icon: typeof Receipt } {
  if (label.startsWith("Expenses")) return { wrap: "bg-[#F4F4F9]", icon: "text-[#635BFF]", Icon: Wallet };
  if (label.startsWith("Net profit")) return { wrap: "bg-[#F4F4F9]", icon: "text-[#635BFF]", Icon: TrendingUp };
  if (label.startsWith("Low stock")) return { wrap: "bg-[#F4F4F9]", icon: "text-[#635BFF]", Icon: Box };
  if (label.startsWith("Orders")) return { wrap: "bg-[#F4F4F9]", icon: "text-[#635BFF]", Icon: ShoppingBag };
  if (label.startsWith("Debts")) return { wrap: "bg-[#F4F4F9]", icon: "text-[#635BFF]", Icon: Wallet };
  // Sales today / Sales <date> and fallback
  return { wrap: "bg-[#F4F4F9]", icon: "text-[#635BFF]", Icon: Receipt };
}

function hrefFor(label: string) {
  if (label === "Orders to do") return "/storefront";
  if (label === "Low stock") return "/inventory?focus=low";
  if (label === "Debts due") return "/debts";
  if (label.startsWith("Sales")) return "/sales?today=1";
  if (label.startsWith("Expenses")) return "/expenses?today=1";
  return "";
}

function getTimeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const lagosNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
  const lagosThen = new Date(d.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
  const diff = (lagosNow.getTime() - lagosThen.getTime()) / 1000;
  if (isNaN(diff) || diff < 0) return "Just now";
  if (diff < 60) return "Just now";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function SavedHome({ snapshot, offline = false, unreadAlerts = 0 }: { snapshot?: Snapshot | null; offline?: boolean; unreadAlerts?: number }) {
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

  const salesItems = (saved.today || []).map((sale) => ({
    id: sale.id,
    kind: "sale" as const,
    title: "New sale",
    timeAgo: getTimeAgo(sale.createdAt),
    amount: `+₦${Number(sale.total).toLocaleString()}`,
    tone: "text-emerald-600",
    Icon: ShoppingCart,
    iconWrap: "bg-[#EAF8F1] text-[#12B76A]",
    createdAt: sale.createdAt || "",
    href: "",
    badge: "",
    detail: "",
  }));

  const costItems = (saved.costs || []).map((cost) => ({
    id: cost.id,
    kind: "cost" as const,
    title: "Expense added",
    timeAgo: getTimeAgo(cost.createdAt),
    amount: `-₦${Number(cost.amount).toLocaleString()}`,
    tone: "text-zinc-900",
    Icon: Wallet,
    iconWrap: "bg-[#F2EFFE] text-[#635BFF]",
    createdAt: cost.createdAt || "",
    href: "",
    badge: "",
    detail: "",
  }));

  const orderItems = (saved.needs || []).map((order) => {
    const raw = order.number || order.id || "";
    const orderCode = raw.startsWith("#") ? raw : `#ORD-${raw.replace(/^#?ORD-/, "").slice(0, 6).toUpperCase()}`;
    return {
      id: order.id,
      kind: "order" as const,
      title: "New order",
      timeAgo: getTimeAgo(order.createdAt),
      amount: orderCode,
      tone: "text-[#635BFF]",
      Icon: ClipboardList,
      iconWrap: "bg-[#EFF6FF] text-[#2E90FA]",
      createdAt: order.createdAt || "",
      href: `/storefront?order=${encodeURIComponent(order.id)}`,
      badge: order.status === "pending" ? "Pending" : "",
      detail: "",
    };
  });

  const debtItems = (saved.debts || []).map((debt) => ({
    id: debt.id,
    kind: "debt" as const,
    title: "Debt recorded",
    timeAgo: getTimeAgo(debt.createdAt),
    amount: `₦${Number(debt.amount).toLocaleString()}`,
    tone: "text-zinc-900",
    Icon: Wallet,
    iconWrap: "bg-[#F2EFFE] text-[#635BFF]",
    createdAt: debt.createdAt || "",
    href: "",
    badge: "",
    detail: debt.name,
  }));

  const paymentItems = (saved.payments || []).map((payment) => ({
    id: payment.id,
    kind: "payment" as const,
    title: "Debt payment received",
    timeAgo: getTimeAgo(payment.createdAt),
    amount: `₦${Number(payment.amount).toLocaleString()}`,
    tone: "text-emerald-600",
    Icon: Banknote,
    iconWrap: "bg-[#EAF8F1] text-[#12B76A]",
    createdAt: payment.createdAt || "",
    href: "",
    badge: "",
    detail: payment.name,
  }));

  const activity = [...salesItems, ...costItems, ...orderItems, ...debtItems, ...paymentItems]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 6);

  return (
    <main className="px-4 py-5 pb-28 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header — preserved exactly as-is with shop logo, user avatar, and notification bell with red badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {saved.logoUrl ? (
              <img src={saved.logoUrl} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#635BFF] text-lg font-semibold text-white shadow-sm">{(saved.name || "B").slice(0, 1).toUpperCase()}</span>
            )}
            <div>
              <h1 className="text-lg font-semibold">{saved.name}</h1>
              <p className="text-sm text-zinc-500">{saved.category} · {saved.welcome.replace("Welcome, ", "")}</p>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <Link href="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-zinc-100 shadow-sm" aria-label="Notifications">
              <Bell className="h-5 w-5 text-zinc-800" />
              {unreadAlerts > 0 ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" /> : null}
            </Link>
            <button type="button" onClick={() => setMenu((value) => !value)} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-zinc-200" aria-label="Account">
              {saved.avatarUrl ? <img src={saved.avatarUrl} alt="" className="h-full w-full object-cover" /> : <User className="h-5 w-5 text-zinc-700" />}
            </button>
            {menu ? (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Profile menu</p>
                  <button type="button" onClick={() => setMenu(false)} aria-label="Close"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-3 flex items-center gap-3 border-b border-zinc-100 pb-3">
                  {saved.avatarUrl ? <img src={saved.avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#635BFF] text-sm font-semibold text-white">{(saved.welcome.replace("Welcome, ", "") || "A").slice(0, 1).toUpperCase()}</span>}
                  <div>
                    <p className="font-medium">{saved.welcome.replace("Welcome, ", "")}</p>
                    <p className="text-sm text-zinc-500">{saved.email}</p>
                  </div>
                </div>
                <Link href="/account" onClick={() => setMenu(false)} className="mt-3 flex items-center gap-3 py-2">
                  <User className="h-4 w-4 text-zinc-500" />
                  <span className="flex-1"><span className="block font-medium">Account Details</span><span className="text-sm text-zinc-500">View and edit your personal information</span></span>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </Link>
                <Link href="/forgot-password" onClick={() => setMenu(false)} className="flex items-center gap-3 border-t border-zinc-100 py-3">
                  <Lock className="h-4 w-4 text-zinc-500" />
                  <span className="flex-1 font-medium">Change Password</span>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </Link>
                <form action={logoutAction} className="border-t border-zinc-100 pt-2">
                  <button type="submit" className="flex items-center gap-2 py-2 text-sm font-medium text-rose-600">
                    <LogOut className="h-4 w-4" /> Log Out
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
        {offline ? <p className="mt-2 text-xs text-zinc-500">Last saved numbers</p> : null}

        {/* Upgrade 2 — Taller rounded-xl buttons with subtle elevation */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={share}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#635BFF] px-4 text-sm font-semibold text-white shadow-md shadow-[#635BFF]/30 active:shadow-sm transition-shadow"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white"><path d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l5.9-1.1A11 11 0 0 0 20.5 3.5zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.5.7.7-3.4-.2-.3A9.1 9.1 0 1 1 12 20.5zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.7 11.5 11.5 0 0 0 4.4 3.9 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z"/></svg>
            Share summary
          </button>
          <Link
            href="/storefront"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold shadow-sm active:shadow-none transition-shadow"
          >
            <Store className="h-4 w-4 text-[#635BFF]" /> Open store
          </Link>
        </div>

        {/* Business overview header with date selector pill — preserved */}
        <div className="mt-7 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Business overview</h2>
          <label className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-[#635BFF]">
            <Calendar className="h-3.5 w-3.5" />
            <input
              type="date"
              defaultValue={saved.dateValue || new Date().toISOString().slice(0, 10)}
              onChange={(event) => { window.location.href = `/dashboard?date=${event.target.value}`; }}
              className="bg-transparent text-[#635BFF] outline-none"
            />
          </label>
        </div>

        {/* Upgrade 1 — Uniform #F4F4F9 KPI cards with crisp #635BFF icons */}
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {saved.stats.map(([label, value, note]) => {
            const tone = getTone(label);
            const Icon = tone.Icon;
            const href = hrefFor(label);
            const body = (
              <>
                <div className="flex items-center gap-2">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm ${tone.icon}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-zinc-500">{label}</p>
                </div>
                <p className="mt-3 text-2xl font-semibold text-zinc-900">{value}</p>
                {note ? <p className="mt-1 text-xs font-medium text-amber-700">{note}</p> : null}
              </>
            );
            const klass = `rounded-2xl ${tone.wrap} p-4 border border-zinc-100`;
            return href ? <Link key={label} href={href} className={klass}>{body}</Link> : <div key={label} className={klass}>{body}</div>;
          })}
        </div>

        {/* Upgrade 3 — Recent activity with clean pastel circular badges, matching target mockup 1 */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Recent activity</h2>
            <Link href="/activity" className="flex items-center gap-1 text-sm font-medium text-[#635BFF] hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-3.5">
            {activity.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-500">No sales, costs, or orders yet.</div>
            ) : activity.map((item) => {
              const row = (
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.iconWrap}`}>
                      <item.Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-zinc-900">{item.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{item.detail ? `${item.detail} · ${item.timeAgo}` : item.timeAgo}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className={`text-sm font-semibold ${item.tone}`}>{item.amount}</p>
                    {item.badge ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">{item.badge}</span> : null}
                  </div>
                </div>
              );
              return item.href ? <Link key={item.id} href={item.href}>{row}</Link> : <div key={item.id}>{row}</div>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Box,
  ChevronRight,
  Home,
  MoreHorizontal,
  Receipt,
  Settings,
  ShoppingBag,
  Store,
  Users,
  Wallet,
  X,
} from "lucide-react";

const primary = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/sales", label: "Sales", icon: Receipt },
  { href: "/inventory", label: "Products", icon: Box },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const moreOwner = [
  { href: "/storefront", label: "Store", icon: Store },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/debts", label: "Debts", icon: ShoppingBag },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/staff", label: "Staff", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

const moreStaff = [
  { href: "/storefront", label: "Store", icon: Store },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/debts", label: "Debts", icon: ShoppingBag },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppNav({ role = "owner", alertCount = 0 }: { role?: string; alertCount?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const more = role === "owner" ? moreOwner : moreStaff;
  const moreActive = more.some((item) => isActive(pathname, item.href));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/onboarding")) return null;

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-zinc-200 bg-white p-4 md:block">
        <nav className="flex flex-col gap-1">
          {[...primary, ...more].map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  active ? "bg-[#635BFF] text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.href === "/notifications" && alertCount > 0 ? (
                  <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active ? "bg-white text-[#635BFF]" : "bg-[#635BFF] text-white"}`}>{alertCount}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="grid grid-cols-5">
          {primary.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} prefetch className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium ${active ? "text-[#635BFF]" : "text-zinc-500"}`}>
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <button type="button" onClick={() => setOpen(true)} className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium ${moreActive ? "text-[#635BFF]" : "text-zinc-500"}`}>
            <MoreHorizontal className="h-5 w-5" />
            More
          </button>
        </div>
      </nav>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="absolute inset-x-3 bottom-3 rounded-3xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-lg font-semibold">More</p>
              <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {more.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} prefetch onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl px-2 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#635BFF]/10 text-[#635BFF]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.href === "/notifications" && alertCount > 0 ? (
                      <span className="rounded-full bg-[#635BFF] px-1.5 py-0.5 text-[10px] font-semibold text-white">{alertCount}</span>
                    ) : null}
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

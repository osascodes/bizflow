"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ownerItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/inventory", label: "Stock" },
  { href: "/sales", label: "Sales" },
  { href: "/customers", label: "Customers" },
  { href: "/debts", label: "Debts" },
  { href: "/expenses", label: "Costs" },
  { href: "/storefront", label: "Store" },
  { href: "/analytics", label: "Stats" },
  { href: "/activity", label: "Activity" },
  { href: "/staff", label: "Staff" },
  { href: "/notifications", label: "Alerts" },
  { href: "/settings", label: "Settings" },
];

const staffItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/inventory", label: "Stock" },
  { href: "/sales", label: "Sales" },
  { href: "/customers", label: "Customers" },
  { href: "/debts", label: "Debts" },
  { href: "/storefront", label: "Store" },
];

export default function AppNav({ role = "owner" }: { role?: string }) {
  const pathname = usePathname();
  const [pressed, setPressed] = useState("");
  if (pathname.startsWith("/onboarding")) return null;
  const items = role === "owner" ? ownerItems : staffItems;

  const linkClass = (href: string, active: boolean, mobile = false) => {
    const waiting = pressed === href && !active;
    if (mobile) {
      return `shrink-0 rounded-full px-3 py-2 text-sm font-medium touch-manipulation ${
        active ? "bg-zinc-800 text-white" : waiting ? "bg-zinc-800 text-amber-200" : "text-zinc-400"
      }`;
    }
    return `rounded-xl px-3 py-2 text-sm font-medium touch-manipulation ${
      active ? "bg-zinc-800 text-white" : waiting ? "bg-zinc-800 text-amber-200" : "text-zinc-400 hover:text-white"
    }`;
  };

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-zinc-800 p-4 md:block">
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={() => setPressed(item.href)}
                className={linkClass(item.href, active)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="sticky top-0 z-20 flex gap-2 overflow-x-auto border-b border-zinc-800 bg-zinc-950 px-3 py-2 md:hidden">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={() => setPressed(item.href)}
              className={linkClass(item.href, active, true)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

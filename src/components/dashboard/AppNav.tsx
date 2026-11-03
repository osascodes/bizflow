"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const [pressed, setPressed] = useState("");
  const items = role === "owner" ? ownerItems : staffItems;
  const current = items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/onboarding")) return null;

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
                className={`rounded-xl px-3 py-2 text-sm font-medium touch-manipulation ${
                  active ? "bg-zinc-800 text-white" : pressed === item.href ? "bg-zinc-800 text-amber-200" : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-700 px-4 text-sm font-semibold text-white"
          aria-label="Open menu"
        >
          <span className="flex flex-col gap-1">
            <span className="h-0.5 w-4 bg-white" />
            <span className="h-0.5 w-4 bg-white" />
            <span className="h-0.5 w-4 bg-white" />
          </span>
          Menu
        </button>
        <p className="text-sm font-medium text-zinc-300">{current?.label || "BizFlow"}</p>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-label="Close menu" />
          <nav className="absolute inset-y-0 left-0 flex w-72 flex-col bg-zinc-950 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Menu</p>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-zinc-400">
                Close
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    onClick={() => {
                      setPressed(item.href);
                      setOpen(false);
                    }}
                    className={`rounded-xl px-3 py-3 text-sm font-medium ${
                      active ? "bg-zinc-800 text-white" : "text-zinc-300"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}

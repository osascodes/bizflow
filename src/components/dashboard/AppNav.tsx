"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Home" },
  { href: "/inventory", label: "Stock" },
  { href: "/sales", label: "Sales" },
  { href: "/debts", label: "Debts" },
  { href: "/storefront", label: "Store" },
];

export default function AppNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/onboarding")) return null;

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-zinc-800 p-4 md:block">
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-zinc-800 bg-zinc-950/95 px-2 py-2 backdrop-blur md:hidden">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-12 items-center justify-center rounded-xl text-xs font-medium ${
                active ? "text-white" : "text-zinc-500"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

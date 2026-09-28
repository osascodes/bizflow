"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-bold text-white">
            B
          </span>
          <span className="text-lg font-semibold text-white">BizFlow</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <Link href="/login" className="hover:text-white">Sign In</Link>
          <Link href="/register" className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 font-medium text-white">
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open ? (
        <div className="space-y-4 border-t border-zinc-800 px-6 py-5 md:hidden">
          <a href="#features" className="block text-sm text-zinc-300" onClick={() => setOpen(false)}>Features</a>
          <a href="#pricing" className="block text-sm text-zinc-300" onClick={() => setOpen(false)}>Pricing</a>
          <Link href="/login" className="block text-sm text-zinc-300" onClick={() => setOpen(false)}>Sign In</Link>
          <Link href="/register" className="flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-medium text-white" onClick={() => setOpen(false)}>
            Get Started
          </Link>
        </div>
      ) : null}
    </header>
  );
}

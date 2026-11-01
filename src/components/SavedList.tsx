"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type SavedItem = {
  id: string;
  title: string;
  detail: string;
  href?: string;
};

export default function SavedList({
  storageKey,
  title,
  subtitle,
  items,
  offline = false,
}: {
  storageKey: string;
  title: string;
  subtitle: string;
  items?: SavedItem[] | null;
  offline?: boolean;
}) {
  const [saved, setSaved] = useState<SavedItem[] | null>(items || null);

  useEffect(() => {
    if (items) {
      localStorage.setItem(storageKey, JSON.stringify(items));
      setSaved(items);
      return;
    }
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      setSaved(JSON.parse(raw) as SavedItem[]);
    } catch {
      setSaved([]);
    }
  }, [items, storageKey]);

  if (items && !offline) return null;

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
        {offline ? <p className="mt-3 text-xs text-amber-300">Last saved list. Adding or editing needs the network.</p> : null}
        <div className="mt-6 space-y-3">
          {!saved ? (
            <p className="text-sm text-zinc-500">Open this page once while online.</p>
          ) : saved.length === 0 ? (
            <p className="text-sm text-zinc-500">Nothing saved yet.</p>
          ) : (
            saved.map((item) => {
              const body = (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <h2 className="font-semibold text-white">{item.title}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{item.detail}</p>
                </div>
              );
              return item.href && !offline ? (
                <Link key={item.id} href={item.href} className="block">{body}</Link>
              ) : (
                <div key={item.id}>{body}</div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

type Snapshot = {
  category: string;
  name: string;
  welcome: string;
  role: string;
  stats: [string, string][];
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
          {saved.stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

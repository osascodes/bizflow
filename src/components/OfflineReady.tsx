"use client";

import { useEffect, useState } from "react";

export default function OfflineReady() {
  const [offline, setOffline] = useState(false);
  const [back, setBack] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const update = () => {
      const now = !navigator.onLine;
      setOffline((was) => {
        if (was && !now) {
          setBack(true);
          window.setTimeout(() => setBack(false), 2500);
        }
        return now;
      });
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (offline) {
    return (
      <div className="fixed inset-x-0 top-0 z-50 bg-zinc-800 px-4 py-2 text-center text-sm font-medium text-white">
        Offline. Showing the last saved page.
      </div>
    );
  }

  if (back) {
    return (
      <div className="fixed inset-x-0 top-0 z-50 bg-[#635BFF] px-4 py-2 text-center text-sm font-medium text-white">
        Back online. Sending saved items.
      </div>
    );
  }

  return null;
}

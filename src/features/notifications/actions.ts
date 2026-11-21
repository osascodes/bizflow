"use server";

import { cookies } from "next/headers";

export async function markAlertsSeen() {
  const store = await cookies();
  store.set("brinset_alerts_seen", new Date().toISOString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

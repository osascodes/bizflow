"use client";

import { useState } from "react";
import { choosePlanAction } from "@/features/business/actions";

export default function PlanCard({
  plan,
  trialEnds,
}: {
  plan?: string | null;
  trialEnds?: string | null;
}) {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState("");
  const daysLeft = trialEnds
    ? Math.max(0, Math.ceil((new Date(trialEnds).getTime() - Date.now()) / 86400000))
    : null;
  const label = plan === "pro" ? "Pro" : plan === "starter" ? "Starter" : "Free trial";

  const choose = async (next: "starter" | "pro") => {
    setErrorMessage("");
    setPending(next);
    try {
      const formData = new FormData();
      formData.set("plan", next);
      await choosePlanAction(formData);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not change plan");
    } finally {
      setPending("");
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">Plan</p>
      <p className="mt-1 text-lg font-semibold text-white">{label}</p>
      {plan !== "starter" && plan !== "pro" && daysLeft !== null ? (
        <p className="mt-1 text-sm text-zinc-300">{daysLeft} days of Pro left</p>
      ) : null}
      <p className="mt-3 text-sm text-zinc-400">Payment is not on yet. Choosing a plan saves it on the shop.</p>
      {errorMessage ? <p className="mt-3 text-sm text-red-400">{errorMessage}</p> : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => choose("starter")} disabled={pending !== ""} className="h-11 rounded-full border border-zinc-700 text-sm font-semibold text-white">
          {pending === "starter" ? "Saving..." : "Starter · ₦5,000"}
        </button>
        <button type="button" onClick={() => choose("pro")} disabled={pending !== ""} className="h-11 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold text-white">
          {pending === "pro" ? "Saving..." : "Pro · ₦10,000"}
        </button>
      </div>
    </div>
  );
}

import Link from "next/link";
import { confirmPlanPaymentAction } from "@/features/billing/actions";

export default async function BillingCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  let plan = "";
  let errorMessage = "";

  if (!reference) {
    errorMessage = "Payment reference is missing.";
  } else {
    try {
      const result = await confirmPlanPaymentAction(reference);
      plan = result.plan;
    } catch (error: unknown) {
      errorMessage = error instanceof Error ? error.message : "Could not confirm payment";
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold">{errorMessage ? "Payment not confirmed" : "Plan updated"}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          {errorMessage || `Your shop is now on ${plan === "pro" ? "Pro" : "Starter"}.`}
        </p>
        <Link href="/settings" className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold text-white">
          Back to settings
        </Link>
      </div>
    </main>
  );
}

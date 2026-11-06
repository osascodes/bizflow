"use server";

import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

const prices = { starter: 500000, pro: 1000000 };

export async function startPlanPaymentAction(formData: FormData) {
  const plan = String(formData.get("plan") || "");
  if (plan !== "starter" && plan !== "pro") throw new Error("Pick a plan");

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack is not set up yet. Add PAYSTACK_SECRET_KEY.");

  const business = await getCurrentBusiness();
  if (!business || business.role !== "owner") throw new Error("Only the owner can change the plan");

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("This account has no email");

  const headerList = await headers();
  const origin = headerList.get("origin") || process.env.NEXT_PUBLIC_APP_URL;
  if (!origin) throw new Error("Could not find the app URL");

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      amount: prices[plan],
      currency: "NGN",
      callback_url: `${origin}/billing/callback`,
      metadata: { business_id: business.id, plan },
    }),
  });

  const body = await response.json();
  if (!response.ok || !body?.data?.authorization_url) {
    throw new Error(body?.message || "Could not start payment");
  }

  return { url: body.data.authorization_url as string };
}

export async function confirmPlanPaymentAction(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack is not set up yet.");

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await response.json();
  if (!response.ok || body?.data?.status !== "success") {
    throw new Error(body?.message || "Payment was not successful");
  }

  const plan = body.data.metadata?.plan;
  const businessId = body.data.metadata?.business_id;
  if ((plan !== "starter" && plan !== "pro") || !businessId) {
    throw new Error("Payment is missing the plan");
  }

  const business = await getCurrentBusiness();
  if (!business || business.id !== businessId || business.role !== "owner") {
    throw new Error("This payment is not for your shop");
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("businesses")
    .update({ plan, trial_ends_at: null })
    .eq("id", business.id);
  if (error) throw new Error(error.message);

  return { plan };
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { businessCategories, onboardingSchema } from "@/features/business/schema";
import { createBusinessAction } from "@/features/business/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormData = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      phone: "",
      category: "Fashion",
    },
  });

  const onSubmit = async (data: FormData) => {
    setErrorMessage("");
    setPending(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("category", data.category);
      await createBusinessAction(formData);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save business.");
      setPending(false);
    }
  };

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-lg">
        <p className="text-sm text-violet-300">Set up your shop</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Tell us about your business</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          This creates your storefront link and keeps inventory, sales, and debts under one shop.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
          {errorMessage ? (
            <div className="rounded-md border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">
              {errorMessage}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label className="text-zinc-300">Business name</Label>
            <Input {...form.register("name")} placeholder="Ada Fashion" />
            {form.formState.errors.name ? (
              <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300">Business phone</Label>
            <Input {...form.register("phone")} type="tel" placeholder="0801 234 5678" />
            {form.formState.errors.phone ? (
              <p className="text-xs text-red-400">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300">Category</Label>
            <select
              {...form.register("category")}
              className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white"
            >
              {businessCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Continue to dashboard"}
          </Button>
        </form>
      </div>
    </main>
  );
}

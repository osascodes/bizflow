"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { forgotPasswordSchema } from "@/features/auth/schema";
import { forgotPasswordAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/features/auth/components/AuthCard";
import { useAuthForm } from "@/features/auth/hooks";

type FormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { isPending, startTransition } = useAuthForm();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: FormData) => {
    setErrorMessage("");
    setSuccessMessage("");

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("email", data.email);
        const result = await forgotPasswordAction(formData);
        setSuccessMessage(result.message);
      } catch (error: unknown) {
        setErrorMessage(
          error instanceof Error ? error.message : "Could not send reset email.",
        );
      }
    });
  };

  return (
    <AuthCard title="Reset your password">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage ? (
          <div className="rounded-md border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">
            {errorMessage}
          </div>
        ) : null}
        {successMessage ? (
          <div className="rounded-md border border-green-500 bg-green-500/10 p-3 text-sm text-green-400">
            {successMessage}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            {...form.register("email")}
            type="email"
            placeholder="you@example.com"
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-violet-400 hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}

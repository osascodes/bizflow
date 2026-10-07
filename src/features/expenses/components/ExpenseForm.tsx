"use client";

import { useState } from "react";
import { createExpenseAction } from "@/features/expenses/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const categories = ["Stock", "Rent", "Transport", "Ads", "Other"];

export default function ExpenseForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
      action={async (formData) => {
        setErrorMessage("");
        setPending(true);
        try {
          await createExpenseAction(formData);
        } catch (error: unknown) {
          setErrorMessage(error instanceof Error ? error.message : "Could not save expense.");
        } finally {
          setPending(false);
        }
      }}
    >
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">What did you spend on?</Label>
        <Input name="title" placeholder="Fabric" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Category</Label>
        <select name="category" className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white">
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Amount</Label>
        <Input name="amount" type="number" min="1" step="0.01" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>{pending ? "Saving..." : "Save expense"}</Button>
    </form>
  );
}

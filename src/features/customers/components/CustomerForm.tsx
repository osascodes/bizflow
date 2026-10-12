"use client";

import { useState } from "react";
import { createCustomerAction } from "@/features/customers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      id="customer-form"
      className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
      action={async (formData) => {
        setErrorMessage("");
        setPending(true);
        try {
          await createCustomerAction(formData);
          (document.getElementById("customer-form") as HTMLFormElement | null)?.reset();
        } catch (error: unknown) {
          setErrorMessage(error instanceof Error ? error.message : "Could not add customer.");
        } finally {
          setPending(false);
        }
      }}
    >
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Name</Label>
        <Input name="name" placeholder="Chioma" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Phone</Label>
        <Input name="phone" placeholder="08012345678" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>{pending ? "Saving..." : "Add customer"}</Button>
    </form>
  );
}

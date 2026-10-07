"use client";

import { useState } from "react";
import { createCustomerAction, createDebtAction, recordPaymentAction } from "@/features/debts/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Customer = { id: string; name: string; phone: string | null };

export function CustomerForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
      action={async (formData) => {
        setErrorMessage("");
        setPending(true);
        try {
          await createCustomerAction(formData);
        } catch (error: unknown) {
          setErrorMessage(error instanceof Error ? error.message : "Could not save customer.");
        } finally {
          setPending(false);
        }
      }}
    >
      <h2 className="font-semibold text-white">Add customer</h2>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Name</Label>
        <Input name="name" placeholder="Ada" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Phone</Label>
        <Input name="phone" placeholder="0801 234 5678" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>{pending ? "Saving..." : "Save customer"}</Button>
    </form>
  );
}

export function DebtForm({ customers }: { customers: Customer[] }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
      action={async (formData) => {
        setErrorMessage("");
        setPending(true);
        try {
          await createDebtAction(formData);
        } catch (error: unknown) {
          setErrorMessage(error instanceof Error ? error.message : "Could not save debt.");
        } finally {
          setPending(false);
        }
      }}
    >
      <h2 className="font-semibold text-white">Record debt</h2>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Customer</Label>
        <select name="customer_id" required className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white">
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Amount</Label>
        <Input name="amount" type="number" min="1" step="0.01" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Note</Label>
        <Input name="note" placeholder="2 gowns, pay Friday" />
      </div>
      <Button type="submit" className="w-full" disabled={pending || customers.length === 0}>{pending ? "Saving..." : "Save debt"}</Button>
    </form>
  );
}

export function PaymentForm({ debtId, balance }: { debtId: string; balance: number }) {
  return (
    <form action={recordPaymentAction} className="mt-3 flex gap-2">
      <input type="hidden" name="debt_id" value={debtId} />
      <Input name="payment" type="number" min="1" step="0.01" placeholder="Payment" className="h-9" />
      <Button type="submit" className="h-9" disabled={balance <= 0}>Pay</Button>
    </form>
  );
}

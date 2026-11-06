"use client";

import { useState } from "react";
import { createCustomerAction, createDebtAction, recordPaymentAction } from "@/features/debts/actions";
import { readDebtQueue, writeDebtQueue } from "@/features/debts/offline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Customer = { id: string; name: string; phone: string | null };

export function CustomerForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
      action={async (formData) => {
        setErrorMessage("");
        setSaved(false);
        setPending(true);
        try {
          await createCustomerAction(formData);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2000);
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
      <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white" disabled={pending}>{pending ? "Saving..." : saved ? "Saved" : "Save customer"}</Button>
    </form>
  );
}

export function DebtForm({ customers }: { customers: Customer[] }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
      action={async (formData) => {
        setErrorMessage("");
        setSaved(false);
        setPending(true);
        try {
          await createDebtAction(formData);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2000);
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
      <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white" disabled={pending || customers.length === 0}>{pending ? "Saving..." : saved ? "Saved" : "Save debt"}</Button>
    </form>
  );
}

export function PaymentForm({ debtId, name = "Customer", balance, onPaid }: { debtId: string; name?: string; balance: number; onPaid?: (amount: number) => void }) {
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [paid, setPaid] = useState(false);

  return (
    <form
      className="mt-3 flex flex-wrap items-center gap-2"
      action={async (formData) => {
        setNotice("");
        setPending(true);
        try {
          const payment = Number(formData.get("payment") || 0);
          if (payment <= 0) throw new Error("Payment must be more than 0");
          if (payment > balance) throw new Error("Payment is more than what is left");
          setPaid(true);
          onPaid?.(payment);
          if (!navigator.onLine) {
            writeDebtQueue([...readDebtQueue(), { id: crypto.randomUUID(), debtId, name, payment }]);
            setNotice("Saved on this phone.");
            return;
          }
          await recordPaymentAction(formData);
          setPaid(true);
          window.setTimeout(() => setPaid(false), 2000);
        } catch (error: unknown) {
          setNotice(error instanceof Error ? error.message : "Could not save payment.");
        } finally {
          setPending(false);
        }
      }}
    >
      <input type="hidden" name="debt_id" value={debtId} />
      <Input name="payment" type="number" min="1" step="0.01" placeholder="Payment" className="h-9" />
      <Button type="submit" className="h-9 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white" disabled={balance <= 0 || pending}>{pending ? "Saving..." : paid ? "Paid" : "Pay"}</Button>
      {notice ? <span className="text-xs text-amber-300">{notice}</span> : null}
    </form>
  );
}

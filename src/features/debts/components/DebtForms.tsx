"use client";

import { useState } from "react";
import { createCustomerAction, createDebtAction, recordPaymentAction } from "@/features/debts/actions";
import { readDebtQueue, writeDebtQueue } from "@/features/debts/offline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Customer = { id: string; name: string; phone: string | null };

export function DebtForm({ customers }: { customers: Customer[] }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);
  const [list, setList] = useState(customers);
  const [selected, setSelected] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const addCustomer = async () => {
    setErrorMessage("");
    setPending(true);
    try {
      const form = new FormData();
      form.set("name", newName);
      form.set("phone", newPhone);
      const created = await createCustomerAction(form);
      if (!created?.id) throw new Error("Could not save customer.");
      setList((current) => current.some((item) => item.id === created.id) ? current : [...current, { id: created.id, name: created.name, phone: newPhone || null }]);
      setSelected(created.id);
      setNewName("");
      setNewPhone("");
      setAdding(false);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save customer.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5"
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
      <h2 className="font-semibold text-zinc-950">Record debt</h2>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-zinc-600">Customer</Label>
          <button type="button" onClick={() => setAdding((value) => !value)} className="text-xs font-medium text-[#635BFF]">{adding ? "Cancel" : "Add new"}</button>
        </div>
        {adding ? (
          <div className="space-y-2 rounded-xl border border-zinc-200 p-3">
            <Input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Customer name" />
            <Input value={newPhone} onChange={(event) => setNewPhone(event.target.value)} placeholder="Phone, optional" />
            <Button type="button" onClick={addCustomer} className="h-9 w-full bg-[#635BFF] text-white" disabled={pending}>{pending ? "Saving..." : "Save customer"}</Button>
          </div>
        ) : null}
        <select name="customer_id" required value={selected} onChange={(event) => setSelected(event.target.value)} className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950">
          <option value="">Select a customer</option>
          {list.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-600">Amount</Label>
        <Input name="amount" type="number" min="1" step="0.01" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-600">Note</Label>
        <Input name="note" placeholder="2 gowns, pay Friday" />
      </div>
      <Button type="submit" className="w-full bg-[#635BFF] text-white" disabled={pending || list.length === 0}>{pending ? "Saving..." : saved ? "Saved" : "Save debt"}</Button>
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
      <Button type="submit" className="h-9 bg-[#635BFF] text-white" disabled={balance <= 0 || pending}>{pending ? "Saving..." : paid ? "Paid" : "Pay"}</Button>
      {notice ? <span className="text-xs text-zinc-500">{notice}</span> : null}
    </form>
  );
}

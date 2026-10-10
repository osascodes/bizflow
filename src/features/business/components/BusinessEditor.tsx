"use client";

import { useState } from "react";
import { updateBusinessAction } from "@/features/business/actions";
import { businessCategories } from "@/features/business/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Business = { name: string; phone: string; category: string };

export default function BusinessEditor({ business }: { business: Business }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="mt-6 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
      action={async (formData) => {
        setErrorMessage("");
        setSaved(false);
        try {
          await updateBusinessAction(formData);
          setSaved(true);
        } catch (error: unknown) {
          setErrorMessage(error instanceof Error ? error.message : "Could not save business.");
        }
      }}
    >
      <h2 className="font-semibold text-white">Shop details</h2>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      {saved ? <p className="text-sm text-emerald-300">Saved. The store link stays the same.</p> : null}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Business name</Label>
        <Input name="name" defaultValue={business.name} required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Phone</Label>
        <Input name="phone" defaultValue={business.phone} required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Category</Label>
        <select name="category" defaultValue={business.category} className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white">
          {businessCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <Button type="submit" className="w-full">Save shop details</Button>
    </form>
  );
}

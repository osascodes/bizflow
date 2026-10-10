"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateBusinessAction } from "@/features/business/actions";
import { businessCategories } from "@/features/business/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Business = { name: string; phone: string; category: string; slug: string };

export default function BusinessEditor({ business }: { business: Business }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [slug, setSlug] = useState(business.slug);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-6 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
      action={async (formData) => {
        setErrorMessage("");
        setPending(true);
        try {
          const result = await updateBusinessAction(formData);
          setSlug(result.slug);
          router.refresh();
        } catch (error: unknown) {
          setErrorMessage(error instanceof Error ? error.message : "Could not save business.");
        } finally {
          setPending(false);
        }
      }}
    >
      <h2 className="font-semibold text-white">Shop details</h2>
      <p className="text-sm text-zinc-400">Current link</p>
      <Link href={`/store/${slug}`} className="inline-flex text-sm text-violet-300">
        /store/{slug}
      </Link>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
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
      <Button type="submit" className="w-full" disabled={pending}>{pending ? "Saving..." : "Save shop details"}</Button>
    </form>
  );
}

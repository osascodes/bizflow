"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateBusinessAction } from "@/features/business/actions";
import { businessCategories } from "@/features/business/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Business = {
  name: string;
  phone: string;
  category: string;
  slug: string;
  logo_url?: string | null;
  hero_url?: string | null;
  store_headline?: string | null;
  store_description?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  website?: string | null;
};

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
      <Link href={`/store/${slug}`} className="inline-flex text-sm text-violet-300">/store/{slug}</Link>
      <div className="flex gap-3">
        {business.logo_url ? <img src={business.logo_url} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : null}
        {business.hero_url ? <img src={business.hero_url} alt="" className="h-16 w-28 rounded-2xl object-cover" /> : null}
      </div>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Logo</Label>
        <Input name="logo" type="file" accept="image/*" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Hero image, optional</Label>
        <Input name="hero" type="file" accept="image/*" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Store headline</Label>
        <Input name="store_headline" defaultValue={business.store_headline || ""} placeholder="Shop Solo Gadgets" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Store description</Label>
        <Input name="store_description" defaultValue={business.store_description || ""} placeholder="Gadgets and accessories, ready to order." />
      </div>
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
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Instagram</Label>
        <Input name="instagram" defaultValue={business.instagram || ""} placeholder="https://instagram.com/yourshop" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">TikTok</Label>
        <Input name="tiktok" defaultValue={business.tiktok || ""} placeholder="https://tiktok.com/@yourshop" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Website</Label>
        <Input name="website" defaultValue={business.website || ""} placeholder="https://yourshop.com" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>{pending ? "Saving..." : "Save shop details"}</Button>
    </form>
  );
}

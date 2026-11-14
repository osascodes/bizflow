"use client";

import { useState } from "react";
import { updateAccountAction } from "@/features/auth/actions";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function AccountForm({ name, email, phone, avatar }: { name: string; email: string; phone: string; avatar: string }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState("");
  const [preview, setPreview] = useState(avatar);
  const [file, setFile] = useState<File | null>(null);
  const letter = (name || email || "A").slice(0, 1).toUpperCase();

  return (
    <form
      className="mt-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setDone("");
        try {
          const form = new FormData(event.currentTarget);
          if (file) {
            const supabase = createBrowserSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not signed in");
            const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
            const path = `${user.id}/avatar-${Date.now()}-${safeName}`;
            const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type || "image/jpeg" });
            if (error) throw new Error(error.message);
            form.set("avatar_url", supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
          }
          await updateAccountAction(form);
          setDone("Saved");
          setFile(null);
        } catch (error) {
          setDone(error instanceof Error ? error.message : "Could not save");
        } finally {
          setSaving(false);
          setTimeout(() => setDone(""), 2500);
        }
      }}
    >
      <label className="flex cursor-pointer flex-col items-center gap-2 border-b border-zinc-200 pb-6">
        {preview ? (
          <img src={preview} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#635BFF] text-2xl font-semibold text-white">{letter}</span>
        )}
        <span className="text-sm text-zinc-500">Change profile photo</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const next = event.target.files?.[0];
            if (!next) return;
            setFile(next);
            setPreview(URL.createObjectURL(next));
          }}
        />
      </label>
      <label className="mt-5 block border-b border-zinc-200 pb-3">
        <span className="text-sm text-zinc-500">Full name</span>
        <input name="full_name" defaultValue={name} className="mt-1 w-full bg-transparent text-base font-medium outline-none" />
      </label>
      <label className="mt-5 block border-b border-zinc-200 pb-3">
        <span className="text-sm text-zinc-500">Email address</span>
        <input value={email} readOnly className="mt-1 w-full bg-transparent text-base font-medium text-zinc-700 outline-none" />
      </label>
      <label className="mt-5 block border-b border-zinc-200 pb-3">
        <span className="text-sm text-zinc-500">Phone number</span>
        <input name="phone" defaultValue={phone} placeholder="+234" className="mt-1 w-full bg-transparent text-base font-medium outline-none" />
      </label>
      <button type="submit" className="mt-6 h-11 w-full rounded-full bg-zinc-950 text-sm font-semibold text-white">
        {saving ? "Saving..." : done || "Save Changes"}
      </button>
    </form>
  );
}

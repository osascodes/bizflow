"use client";

import { useState } from "react";
import { updateAccountAction } from "@/features/auth/actions";

export default function AccountForm({ name, email, phone, avatar }: { name: string; email: string; phone: string; avatar: string }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState("");
  const [preview, setPreview] = useState(avatar);
  const letter = (name || email || "A").slice(0, 1).toUpperCase();

  return (
    <form
      className="mt-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setDone("");
        try {
          await updateAccountAction(new FormData(event.currentTarget));
          setDone("Saved");
        } catch (error) {
          setDone(error instanceof Error ? error.message : "Could not save");
        } finally {
          setSaving(false);
          setTimeout(() => setDone(""), 1600);
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
          name="photo"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
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

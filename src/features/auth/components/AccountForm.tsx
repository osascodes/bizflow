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
      className="mt-6 space-y-4"
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
      <label className="flex items-center gap-3">
        {preview ? (
          <img src={preview} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#635BFF] text-xl font-semibold text-white">{letter}</span>
        )}
        <span>
          <span className="block font-medium">Profile Photo</span>
          <span className="block text-sm text-zinc-500">Upload or change photo</span>
        </span>
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
      <label className="block">
        <span className="text-sm text-zinc-500">Full Name</span>
        <input name="full_name" defaultValue={name} className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm" />
      </label>
      <label className="block">
        <span className="text-sm text-zinc-500">Email Address</span>
        <input value={email} readOnly className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-600" />
      </label>
      <label className="block">
        <span className="text-sm text-zinc-500">Phone Number</span>
        <input name="phone" defaultValue={phone} placeholder="+234" className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm" />
      </label>
      <button type="submit" className="h-11 w-full rounded-full bg-zinc-950 text-sm font-semibold text-white">
        {saving ? "Saving..." : done || "Save Changes"}
      </button>
    </form>
  );
}

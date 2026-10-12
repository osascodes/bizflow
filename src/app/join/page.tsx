"use client";

import { useState } from "react";
import Link from "next/link";
import { joinStaffAction } from "@/features/staff/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function JoinPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <form
        className="w-full max-w-sm space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
        action={async (formData) => {
          setErrorMessage("");
          setPending(true);
          try {
            await joinStaffAction(formData);
          } catch (error: unknown) {
            setErrorMessage(error instanceof Error ? error.message : "Could not join.");
            setPending(false);
          }
        }}
      >
        <h1 className="text-2xl font-semibold">Join a shop</h1>
        <p className="text-sm text-zinc-400">Use the invite code from the shop owner.</p>
        {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
        <div className="space-y-1.5">
          <Label>Invite code</Label>
          <Input name="code" placeholder="A1B2C3" required />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Joining..." : "Join shop"}</Button>
        <Link href="/login" className="block text-center text-sm text-zinc-400">Already joined? Log in</Link>
      </form>
    </main>
  );
}

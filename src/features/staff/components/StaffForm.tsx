"use client";

import { useState } from "react";
import { createStaffAction } from "@/features/staff/actions";
import { staffRoles } from "@/features/staff/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StaffForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
      action={async (formData) => {
        setErrorMessage("");
        setPending(true);
        try {
          await createStaffAction(formData);
          (document.getElementById("staff-form") as HTMLFormElement | null)?.reset();
        } catch (error: unknown) {
          setErrorMessage(error instanceof Error ? error.message : "Could not add staff.");
        } finally {
          setPending(false);
        }
      }}
      id="staff-form"
    >
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Name</Label>
        <Input name="name" placeholder="Ada" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Phone</Label>
        <Input name="phone" placeholder="08012345678" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Role</Label>
        <select name="role" defaultValue="Sales" className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white">
          {staffRoles.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>{pending ? "Saving..." : "Add staff"}</Button>
    </form>
  );
}

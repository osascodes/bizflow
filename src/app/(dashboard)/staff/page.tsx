import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getStaff } from "@/features/staff/queries";
import { toggleStaffAction } from "@/features/staff/actions";
import StaffForm from "@/features/staff/components/StaffForm";
import { Button } from "@/components/ui/button";

export default async function StaffPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  const staff = await getStaff();

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
        <div>
          <h1 className="text-2xl font-semibold text-white">Staff</h1>
          <p className="mt-2 text-sm text-zinc-400">People who help run the shop.</p>
          <div className="mt-6">
            <StaffForm />
          </div>
        </div>
        <div className="space-y-3">
          {staff.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">No staff yet.</div>
          ) : (
            staff.map((member) => (
              <div key={member.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-white">{member.name}</h2>
                    <p className="mt-1 text-sm text-zinc-400">{member.role} · {member.phone}</p>
                    <p className="mt-1 text-xs text-zinc-500">{member.active ? "Active" : "Paused"}</p>
                  </div>
                  <form action={toggleStaffAction}>
                    <input type="hidden" name="id" value={member.id} />
                    <input type="hidden" name="active" value={String(member.active)} />
                    <Button type="submit" variant="outline" className="h-9">{member.active ? "Pause" : "Activate"}</Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

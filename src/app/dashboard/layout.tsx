import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { redirect } from "next/navigation";
import AppNav from "@/components/dashboard/AppNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, offline } = await getAuthState();
  if (!user && !offline) redirect("/login");

  let business = null;
  try {
    business = await getCurrentBusiness();
  } catch {
    business = null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="md:flex">
        <AppNav role={business?.role === "owner" ? "owner" : "staff"} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { logoutAction } from "@/features/auth/actions";
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
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <img src="/brinset-logo.png" alt="Brinset" className="h-8 w-auto object-contain" />
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-zinc-400 hover:text-zinc-950">
            Log out
          </button>
        </form>
      </header>
      <div className="md:flex">
        <AppNav role={business?.role === "owner" ? "owner" : "staff"} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { logoutAction } from "@/features/auth/actions";
import { redirect } from "next/navigation";
import AppNav from "@/components/dashboard/AppNav";
import { getAlertCount } from "@/features/notifications/queries";
import SyncSales from "@/features/sales/components/SyncSales";
import SyncCosts from "@/features/expenses/components/SyncCosts";
import SyncPayments from "@/features/debts/components/SyncPayments";
import SyncStock from "@/features/inventory/components/SyncStock";

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

  let alertCount = 0;
  if (business?.role === "owner") {
    try {
      alertCount = await getAlertCount();
    } catch {
      alertCount = 0;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SyncSales />
      <SyncCosts />
      <SyncPayments />
      <SyncStock />
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-bold">
            B
          </span>
          <span className="font-semibold">BizFlow</span>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-zinc-400 hover:text-white">
            Log out
          </button>
        </form>
      </header>
      <div className="md:flex">
        <AppNav role={business?.role === "owner" ? "owner" : "staff"} alertCount={alertCount} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

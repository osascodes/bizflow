import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
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
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <SyncSales />
      <SyncCosts />
      <SyncPayments />
      <SyncStock />
      <div className="md:flex">
        <AppNav role={business?.role === "owner" ? "owner" : "staff"} alertCount={alertCount} />
        <div className="min-w-0 flex-1 pb-20 md:pb-0">{children}</div>
      </div>
    </div>
  );
}

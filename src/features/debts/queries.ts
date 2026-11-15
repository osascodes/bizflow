import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getCustomers() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("customers")
    .select("id, name, phone")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getDebts() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("debts")
    .select("id, amount, paid, note, created_at, customers(name, phone)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getDebtsDue() {
  const debts = await getDebts();
  return debts.reduce((sum, debt) => sum + Math.max(0, Number(debt.amount) - Number(debt.paid)), 0);
}

export async function getDebtsOwed() {
  const debts = await getDebts();
  return debts
    .map((debt) => ({
      id: debt.id,
      name: (Array.isArray(debt.customers) ? debt.customers[0]?.name : (debt.customers as { name?: string } | null)?.name) || "Customer",
      left: Math.max(0, Number(debt.amount) - Number(debt.paid)),
    }))
    .filter((debt) => debt.left > 0);
}

export async function getRecentDebts() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("debts")
    .select("id, amount, created_at, customers(name)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(10);
  return (data ?? []).map((debt) => {
    const customers = debt.customers as { name?: string } | { name?: string }[] | null;
    const name = Array.isArray(customers) ? customers[0]?.name : customers?.name;
    return {
      id: debt.id,
      name: name || "Customer",
      amount: Number(debt.amount),
      createdAt: debt.created_at as string,
    };
  });
}

export async function getRecentDebtPayments() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("debt_payments")
    .select("id, amount, created_at, debts(customers(name))")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) return [];
  return (data ?? []).map((payment) => {
    const debt = (Array.isArray(payment.debts) ? payment.debts[0] : payment.debts) as { customers?: { name?: string } | { name?: string }[] } | null;
    const customers = debt?.customers;
    const name = Array.isArray(customers) ? customers[0]?.name : customers?.name;
    return {
      id: payment.id,
      name: name || "Customer",
      amount: Number(payment.amount),
      createdAt: payment.created_at as string,
    };
  });
}

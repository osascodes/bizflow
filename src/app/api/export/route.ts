import { NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

function csv(rows: string[][]) {
  return rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

function lagos(value: string) {
  return new Date(value).toLocaleString("en-NG", { timeZone: "Africa/Lagos" });
}

export async function GET(request: NextRequest) {
  const business = await getCurrentBusiness();
  if (!business || business.role !== "owner") {
    return new Response("Not allowed", { status: 403 });
  }
  const type = request.nextUrl.searchParams.get("type") || "sales";
  const supabase = await createServerSupabase();

  if (type === "expenses") {
    const { data } = await supabase.from("expenses").select("title, category, amount, created_at").eq("business_id", business.id).order("created_at", { ascending: false });
    const body = csv([["Title", "Category", "Amount", "Date"], ...(data ?? []).map((row) => [row.title, row.category || "", String(row.amount), lagos(row.created_at)])]);
    return new Response(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=brinset-expenses.csv" } });
  }

  if (type === "products") {
    const { data } = await supabase.from("products").select("name, category, price, cost_price, stock, low_stock_at").eq("business_id", business.id).order("name");
    const body = csv([["Name", "Category", "Selling price", "Cost price", "Stock", "Low stock at"], ...(data ?? []).map((row) => [row.name, row.category || "", String(row.price), row.cost_price == null ? "" : String(row.cost_price), String(row.stock), String(row.low_stock_at)])]);
    return new Response(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=brinset-products.csv" } });
  }

  if (type === "debts") {
    const { data } = await supabase.from("debts").select("amount, paid, note, created_at, customers(name, phone)").eq("business_id", business.id).order("created_at", { ascending: false });
    const body = csv([["Customer", "Phone", "Amount", "Paid", "Left", "Note", "Date"], ...(data ?? []).map((row) => {
      const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
      const left = Math.max(0, Number(row.amount) - Number(row.paid));
      return [customer?.name || "", customer?.phone || "", String(row.amount), String(row.paid), String(left), row.note || "", lagos(row.created_at)];
    })]);
    return new Response(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=brinset-debts.csv" } });
  }

  const { data } = await supabase.from("sales").select("total, created_at, sale_items(name, quantity, price, cost_price)").eq("business_id", business.id).order("created_at", { ascending: false });
  const rows = [["Date", "Item", "Quantity", "Price", "Cost", "Line total", "Sale total"]];
  for (const sale of data ?? []) {
    const items = sale.sale_items ?? [];
    if (items.length === 0) {
      rows.push([lagos(sale.created_at), "Sale", "", "", "", "", String(sale.total)]);
      continue;
    }
    for (const item of items) {
      rows.push([
        lagos(sale.created_at),
        item.name,
        String(item.quantity),
        String(item.price),
        item.cost_price == null ? "" : String(item.cost_price),
        String(Number(item.price) * Number(item.quantity)),
        String(sale.total),
      ]);
    }
  }
  return new Response(csv(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=brinset-sales.csv" } });
}

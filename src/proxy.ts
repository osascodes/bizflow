import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/inventory",
    "/inventory/:path*",
    "/sales",
    "/sales/:path*",
    "/customers",
    "/customers/:path*",
    "/debts",
    "/debts/:path*",
    "/expenses",
    "/expenses/:path*",
    "/storefront",
    "/storefront/:path*",
    "/analytics",
    "/analytics/:path*",
    "/activity",
    "/activity/:path*",
    "/staff",
    "/staff/:path*",
    "/notifications",
    "/notifications/:path*",
    "/settings",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};

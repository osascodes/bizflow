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
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/inventory/:path*",
    "/sales/:path*",
    "/customers/:path*",
    "/debts/:path*",
    "/expenses/:path*",
    "/storefront/:path*",
    "/analytics/:path*",
    "/staff/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};

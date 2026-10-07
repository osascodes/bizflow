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
    "/debts/:path*",
    "/expenses/:path*",
    "/storefront/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};

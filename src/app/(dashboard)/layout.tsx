import { getCurrentUser } from "@/lib/auth/utils";
import { logoutAction } from "@/features/auth/actions";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-bold">
            B
          </span>
          <span className="font-semibold">BizFlow</span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-zinc-400 hover:text-white"
          >
            Log out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}

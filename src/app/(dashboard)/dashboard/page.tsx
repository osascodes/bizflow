import { getCurrentUser } from "@/lib/auth/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const name =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    "there";

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-violet-300">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Welcome, {name}</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          You are signed in. Next we add your business profile, then inventory and sales.
        </p>
      </div>
    </main>
  );
}

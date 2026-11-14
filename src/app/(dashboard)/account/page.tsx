import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getAuthState } from "@/lib/auth/utils";
import AccountForm from "@/features/auth/components/AccountForm";

export default async function AccountPage() {
  const { user } = await getAuthState();
  if (!user) redirect("/login");
  const name = (user.user_metadata?.full_name as string | undefined) || "";
  const phone = (user.user_metadata?.phone as string | undefined) || "";
  const avatar = (user.user_metadata?.avatar_url as string | undefined) || "";

  return (
    <main className="px-4 py-5 pb-28 md:px-8">
      <div className="mx-auto max-w-xl">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-zinc-700">
          <ChevronLeft className="h-4 w-4" /> Account
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Account Details</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your personal account information.</p>
        <AccountForm name={name} email={user.email || ""} phone={phone} avatar={avatar} />
      </div>
    </main>
  );
}

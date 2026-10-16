import { logoutAction } from "@/features/auth/actions";

export default function StartPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
      <div className="w-full max-w-md">
        <p className="text-sm text-violet-300">BizFlow</p>
        <h1 className="mt-2 text-3xl font-semibold">How are you joining?</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">You are logged in, but this account is not linked to a shop yet.</p>
        <div className="mt-8 space-y-3">
          <a href="/onboarding" className="flex h-12 items-center justify-center rounded-full bg-white text-sm font-semibold text-zinc-950">
            I am the owner
          </a>
          <a href="/join" className="flex h-12 items-center justify-center rounded-full border border-zinc-700 text-sm font-semibold">
            I have an invite code
          </a>
          <form action={logoutAction}>
            <button type="submit" className="flex h-12 w-full items-center justify-center rounded-full border border-zinc-700 text-sm font-semibold">
              Log out and sign in as staff
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

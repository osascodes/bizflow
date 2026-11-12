export default function DashboardLoading() {
  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-4 w-64 animate-pulse rounded bg-zinc-100" />
        <div className="grid gap-3">
          <div className="h-24 animate-pulse rounded-2xl bg-white" />
          <div className="h-24 animate-pulse rounded-2xl bg-white" />
          <div className="h-24 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </main>
  );
}

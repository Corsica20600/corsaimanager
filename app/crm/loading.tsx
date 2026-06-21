export default function CrmLoading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="h-6 w-44 animate-pulse rounded-full bg-white/10" />
      <div className="mt-4 h-10 w-80 max-w-full animate-pulse rounded-xl bg-white/10" />
      <div className="mt-8 grid gap-4">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-zinc-900/60" />
        ))}
      </div>
    </main>
  );
}


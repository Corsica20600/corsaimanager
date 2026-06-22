export default function CrmLoading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="h-7 w-52 animate-pulse rounded-full bg-white/10" />
      <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 lg:grid-cols-[1fr_160px_160px_160px_160px_160px_auto]">
        {[0, 1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="h-10 animate-pulse rounded-xl bg-white/10" />
        ))}
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50">
        <div className="grid grid-cols-6 gap-4 border-b border-white/10 p-4">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-4 animate-pulse rounded-full bg-white/10" />
          ))}
        </div>
        <div className="grid gap-0">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="grid grid-cols-6 gap-4 border-b border-white/5 p-4">
              {[0, 1, 2, 3, 4, 5].map((cell) => (
                <div key={cell} className="h-5 animate-pulse rounded-full bg-white/10" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

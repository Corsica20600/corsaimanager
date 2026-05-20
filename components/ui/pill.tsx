export function Pill({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-cyan-200">
      {children}
    </span>
  );
}

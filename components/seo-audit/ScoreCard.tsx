type ScoreCardProps = {
  label: string;
  score: number;
  maxScore?: number;
  detail?: string;
};

export function ScoreCard({ label, score, maxScore = 100, detail }: ScoreCardProps) {
  const percent = Math.round((score / maxScore) * 100);
  const tone =
    percent >= 80
      ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-200"
      : percent >= 60
        ? "border-amber-300/25 bg-amber-400/10 text-amber-100"
        : "border-rose-300/25 bg-rose-400/10 text-rose-100";

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-100">{label}</h3>
          {detail ? <p className="mt-2 text-xs leading-relaxed text-zinc-400">{detail}</p> : null}
        </div>
        <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${tone}`}>{score}/{maxScore}</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400"
          style={{ width: `${Math.max(4, Math.min(100, percent))}%` }}
        />
      </div>
    </article>
  );
}

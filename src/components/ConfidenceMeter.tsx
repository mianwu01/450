import { cn } from "@/lib/utils";

export function ConfidenceMeter({
  value,
  className,
}: {
  value?: number;
  className?: string;
}) {
  if (value == null) return null;
  const pct = Math.round(value * 100);
  const tone =
    pct >= 80 ? "bg-mint" : pct >= 60 ? "bg-sky" : pct >= 45 ? "bg-honey" : "bg-p3";
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      title={`Extractor confidence: ${pct}%`}
    >
      <span className="label">conf</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-3">
        <div
          className={cn("h-full origin-left rounded-full animate-bar-grow", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="num font-mono text-[11px] text-ink-2">{pct}%</span>
    </div>
  );
}

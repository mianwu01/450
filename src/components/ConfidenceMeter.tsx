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
    pct >= 80 ? "bg-mint" : pct >= 60 ? "bg-p2" : pct >= 45 ? "bg-p1" : "bg-p3";
  return (
    <div className={cn("flex items-center gap-2", className)} title={`Extractor confidence: ${pct}%`}>
      <span className="text-[10px] uppercase tracking-wider text-slate-500">conf</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full origin-left rounded-full animate-bar-grow", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[11px] text-slate-400">{pct}%</span>
    </div>
  );
}

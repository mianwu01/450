import { Check, Loader2, Circle, Cpu } from "lucide-react";
import { ANALYSIS_STEPS } from "@/adapters";
import type { StepId, StepStatus } from "@/adapters";
import { cn } from "@/lib/utils";

export function AnalysisLoadingState({
  steps,
  repoLabel,
}: {
  steps: Record<StepId, StepStatus>;
  repoLabel: string;
}) {
  return (
    <div className="mx-auto max-w-xl py-10">
      <div className="glass relative overflow-hidden p-6 animate-fade-up">
        <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-radial-glow opacity-60" />
        <div className="relative">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent to-[#5b8cff] shadow-glow">
              <Cpu className="h-5 w-5 animate-pulse text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Analyzing <span className="text-gradient">{repoLabel}</span>
              </h3>
              <p className="text-[12px] text-slate-500">
                Source-grounded intake → extraction → ranking → trace
              </p>
            </div>
          </div>

          <ol className="space-y-1">
            {ANALYSIS_STEPS.map((s) => {
              const st = steps[s.id] ?? "pending";
              return (
                <li
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    st === "active" && "bg-accent-soft",
                  )}
                >
                  <span className="grid h-5 w-5 place-items-center">
                    {st === "done" ? (
                      <Check className="h-4 w-4 text-mint" />
                    ) : st === "active" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    ) : (
                      <Circle className="h-3 w-3 text-slate-700" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-[13px] transition-colors",
                      st === "done"
                        ? "text-slate-400"
                        : st === "active"
                          ? "font-medium text-slate-100"
                          : "text-slate-600",
                    )}
                  >
                    {s.label}
                  </span>
                  {st === "active" && (
                    <span className="ml-auto flex gap-1">
                      <Dot delay="0ms" />
                      <Dot delay="150ms" />
                      <Dot delay="300ms" />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
      style={{ animationDelay: delay }}
    />
  );
}

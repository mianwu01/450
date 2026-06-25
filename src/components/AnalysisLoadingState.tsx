import { Check, Loader2, Circle } from "lucide-react";
import { ANALYSIS_STEPS } from "@/adapters";
import type { StepId, StepStatus } from "@/adapters";
import { cn } from "@/lib/utils";

export function AnalysisLoadingState({ steps }: { steps: Record<StepId, StepStatus> }) {
  return (
    <div className="card p-5 animate-fade-up">
      <div className="label mb-3">Pipeline</div>
      <ol className="space-y-1">
        {ANALYSIS_STEPS.map((s) => {
          const st = steps[s.id] ?? "pending";
          return (
            <li
              key={s.id}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                st === "active" && "bg-surface-3",
              )}
            >
              <span className="grid h-5 w-5 place-items-center">
                {st === "done" ? (
                  <Check className="h-4 w-4 text-mint" />
                ) : st === "active" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-ink" />
                ) : (
                  <Circle className="h-3 w-3 text-ink-4" />
                )}
              </span>
              <span
                className={cn(
                  "text-[13px] transition-colors",
                  st === "done"
                    ? "text-ink-3"
                    : st === "active"
                      ? "font-medium text-ink"
                      : "text-ink-4",
                )}
              >
                {s.label}
              </span>
              {st === "active" && (
                <span className="ml-auto flex gap-1">
                  <Dot /> <Dot d="0.15s" /> <Dot d="0.3s" />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Dot({ d = "0s" }: { d?: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-3"
      style={{ animationDelay: d }}
    />
  );
}

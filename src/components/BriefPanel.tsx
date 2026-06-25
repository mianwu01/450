import { Cpu, RefreshCw, TriangleAlert, Quote } from "lucide-react";
import { modelLabel } from "@/lib/settings";
import { cn } from "@/lib/utils";

export interface BriefState {
  status: "loading" | "done" | "error";
  text?: string;
  error?: string;
}

export function BriefPanel({
  state,
  model,
  device,
  onRegenerate,
}: {
  state: BriefState;
  model: string;
  device?: string;
  onRegenerate: () => void;
}) {
  const local = model === "nanogpt-local";
  return (
    <section className="card overflow-hidden p-5 animate-fade-up">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-ink">
            <Cpu className="h-[18px] w-[18px] text-accent" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Workflow brief</h2>
            <p className="label">
              {modelLabel(model)}
              {local && device ? ` · ${device}` : ""}
              {local ? " · on-device" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={onRegenerate}
          disabled={state.status === "loading"}
          className="btn px-2.5"
          title="Regenerate"
        >
          <RefreshCw className={cn("h-4 w-4", state.status === "loading" && "animate-spin")} />
        </button>
      </header>

      {state.status === "loading" && (
        <div className="space-y-2">
          <div className="skeleton h-3.5 w-[92%] rounded-full" />
          <div className="skeleton h-3.5 w-[78%] rounded-full" />
          <div className="mt-2 flex items-center gap-1.5 label">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            generating with {local ? "nanoGPT (local)" : modelLabel(model)}…
          </div>
        </div>
      )}

      {state.status === "done" && (
        <div className="animate-fade-in">
          <div className="flex gap-2.5">
            <Quote className="mt-1 h-4 w-4 shrink-0 text-ink-4" />
            <p className="text-[15px] leading-relaxed text-ink">{state.text}</p>
          </div>
          {local && (
            <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-[11px] leading-relaxed text-ink-3">
              Generated on-device by GPT-2 (124M) — a small base model, so prose is rough.
              Priorities and status come from the deterministic ranker; this proves the
              local-model path end to end.
            </p>
          )}
        </div>
      )}

      {state.status === "error" && (
        <div className="animate-fade-in rounded-xl bg-p0-tint/60 px-3.5 py-3">
          <div className="flex items-center gap-2 text-[13px] font-medium text-p0-ink">
            <TriangleAlert className="h-4 w-4" />
            Couldn't reach the local model
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-2">
            {state.error || "The model server didn't respond."} Start it with{" "}
            <code className="rounded bg-surface-3 px-1 py-0.5 font-mono text-[11px]">
              bash server/run_nanogpt.sh
            </code>{" "}
            then retry. The dashboard already works without it (deterministic ranker).
          </p>
          <button onClick={onRegenerate} className="btn mt-2.5 px-3 py-1.5 text-[12px]">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}
    </section>
  );
}

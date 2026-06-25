import {
  AlertTriangle,
  Lock,
  Timer,
  Inbox,
  SearchX,
  WifiOff,
  RefreshCw,
  ShieldQuestion,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AnalysisErrorKind } from "@/adapters";

const MAP: Record<
  AnalysisErrorKind,
  { icon: LucideIcon; tint: string }
> = {
  invalid_repo: { icon: SearchX, tint: "text-p1" },
  not_found: { icon: ShieldQuestion, tint: "text-p1" },
  rate_limit: { icon: Timer, tint: "text-p1" },
  private: { icon: Lock, tint: "text-p0" },
  network: { icon: WifiOff, tint: "text-p0" },
  empty: { icon: Inbox, tint: "text-mint" },
  timeout: { icon: Timer, tint: "text-p1" },
  unknown: { icon: AlertTriangle, tint: "text-p0" },
};

export function ErrorState({
  kind,
  message,
  detail,
  onRetry,
}: {
  kind: AnalysisErrorKind;
  message: string;
  detail?: string;
  onRetry?: () => void;
}) {
  const { icon: Icon, tint } = MAP[kind] ?? MAP.unknown;
  return (
    <div className="mx-auto max-w-md py-12 text-center animate-fade-up">
      <div className="glass p-8">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-line bg-white/[0.03]">
          <Icon className={`h-7 w-7 ${tint}`} />
        </div>
        <h3 className="text-base font-semibold text-slate-100">{message}</h3>
        {detail && (
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-slate-400">
            {detail}
          </p>
        )}
        {(kind === "rate_limit" || kind === "private") && (
          <p className="mt-3 rounded-lg bg-white/[0.03] px-3 py-2 text-[12px] text-slate-400">
            Add a token via the <span className="font-semibold text-mint">Token</span>{" "}
            button (top-right), then retry.
          </p>
        )}
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary mx-auto mt-5">
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function WelcomeHero() {
  return (
    <div className="animate-fade-in py-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            t: "Source-grounded",
            d: "Every todo is extracted from a real issue, PR, or comment — never invented.",
          },
          {
            t: "Traceable",
            d: "Open the Evidence drawer on any card to see the exact snippet and link.",
          },
          {
            t: "Read-only",
            d: "This milestone only reads, summarizes, and prioritizes. No write actions.",
          },
        ].map((f) => (
          <div key={f.t} className="glass-soft p-4">
            <div className="text-[13px] font-semibold text-slate-100">{f.t}</div>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-400">{f.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

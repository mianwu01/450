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

const MAP: Record<AnalysisErrorKind, { icon: LucideIcon; tint: string; color: string }> = {
  invalid_repo: { icon: SearchX, tint: "bg-honey-tint", color: "text-honey" },
  not_found: { icon: ShieldQuestion, tint: "bg-honey-tint", color: "text-honey" },
  rate_limit: { icon: Timer, tint: "bg-honey-tint", color: "text-honey" },
  private: { icon: Lock, tint: "bg-p0-tint", color: "text-p0" },
  network: { icon: WifiOff, tint: "bg-p0-tint", color: "text-p0" },
  empty: { icon: Inbox, tint: "bg-mint-tint", color: "text-mint" },
  timeout: { icon: Timer, tint: "bg-honey-tint", color: "text-honey" },
  unknown: { icon: AlertTriangle, tint: "bg-p0-tint", color: "text-p0" },
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
  const { icon: Icon, tint, color } = MAP[kind] ?? MAP.unknown;
  return (
    <div className="mx-auto max-w-md py-8 text-center animate-fade-up">
      <div className="card p-8">
        <div className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl ${tint}`}>
          <Icon className={`h-7 w-7 ${color}`} />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-ink">{message}</h3>
        {detail && (
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-2">{detail}</p>
        )}
        {(kind === "rate_limit" || kind === "private") && (
          <p className="mt-3 rounded-xl bg-surface-3 px-3 py-2 text-[12px] text-ink-2">
            Add a token via the <span className="font-semibold text-mint">Token</span> button
            (top-right), then retry.
          </p>
        )}
        {onRetry && (
          <button onClick={onRetry} className="btn btn-ink mx-auto mt-5">
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function WelcomeFeatures() {
  const items = [
    { t: "Source-grounded", d: "Every todo is extracted from a real issue, PR, or comment — never invented." },
    { t: "Traceable", d: "Open the Evidence drawer on any card to see the exact snippet and link." },
    { t: "Read-only", d: "This milestone only reads, summarizes, and prioritizes. No write actions." },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((f) => (
        <div key={f.t} className="panel p-4">
          <div className="text-[13px] font-semibold tracking-tight text-ink">{f.t}</div>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-2">{f.d}</p>
        </div>
      ))}
    </div>
  );
}

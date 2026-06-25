import {
  CircleDot,
  GitPullRequest,
  FileText,
  ExternalLink,
  Quote,
  Sparkles,
} from "lucide-react";
import type { TodoItem, TodoSourceType } from "@/types/domain";
import { timeAgo } from "@/lib/format";
import { ConfidenceMeter } from "./ConfidenceMeter";

function SourceIcon({ type }: { type: TodoSourceType }) {
  if (type === "pull_request")
    return <GitPullRequest className="h-3.5 w-3.5 text-p2" />;
  if (type === "repo") return <FileText className="h-3.5 w-3.5 text-slate-400" />;
  return <CircleDot className="h-3.5 w-3.5 text-mint" />;
}

/**
 * The trace/evidence panel. Every generated todo links back to its GitHub
 * source — this is the visible expression of the traceability CTQ.
 */
export function EvidenceDrawer({ todo }: { todo: TodoItem }) {
  return (
    <div className="mt-3 animate-fade-in space-y-3 rounded-xl border border-line bg-ink-950/50 p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Trace · Evidence
        </div>
        <ConfidenceMeter value={todo.confidence} />
      </div>

      {/* Generated rationale */}
      <div className="rounded-lg border border-line bg-white/[0.02] p-3">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
          Generated rationale
        </div>
        <p className="text-[13px] leading-relaxed text-slate-300">
          {todo.rationale || "Baseline ranking — no strong signals detected."}
        </p>
        <div className="mt-2 flex items-center gap-2 rounded-md bg-accent-soft px-2.5 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
            Next
          </span>
          <span className="text-[13px] text-slate-200">{todo.suggestedAction}</span>
        </div>
      </div>

      {/* Source-grounded snippets */}
      <div className="space-y-2">
        {todo.evidence.map((e, i) => (
          <a
            key={i}
            href={e.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-lg border border-line bg-white/[0.02] p-3 transition-colors hover:border-accent/40 hover:bg-accent-soft/40"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <SourceIcon type={e.sourceType} />
                <span className="truncate text-xs font-medium text-slate-300">
                  {e.sourceTitle}
                </span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500 transition-colors group-hover:text-accent" />
            </div>
            <div className="flex gap-2">
              <Quote className="mt-0.5 h-3 w-3 shrink-0 text-slate-600" />
              <p className="font-mono text-[12px] leading-relaxed text-slate-400">
                {e.snippet}
              </p>
            </div>
            {e.timestamp && (
              <div className="mt-1.5 text-[10px] text-slate-600">
                captured {timeAgo(e.timestamp)}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

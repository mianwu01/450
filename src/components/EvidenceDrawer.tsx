import {
  CircleDot,
  GitPullRequest,
  FileText,
  ArrowUpRight,
  Quote,
  Compass,
  Hash,
} from "lucide-react";
import type { Evidence, TodoItem, TodoSourceType } from "@/types/domain";
import { timeAgo } from "@/lib/format";
import { evidenceStore } from "@/logic/evidenceStore";
import { ConfidenceMeter } from "./ConfidenceMeter";

function SourceIcon({ type }: { type: TodoSourceType }) {
  if (type === "pull_request") return <GitPullRequest className="h-3.5 w-3.5 text-p2" />;
  if (type === "repo") return <FileText className="h-3.5 w-3.5 text-ink-3" />;
  return <CircleDot className="h-3.5 w-3.5 text-mint" />;
}

/**
 * Trace / evidence panel. Reads evidence *by trace id* from the evidence store
 * (falling back to the todo's inline evidence if the store misses), and shows
 * the full traceability chain: source type, link, snippet, rationale, timestamp,
 * confidence, and the stable trace id for every link in the chain.
 */
export function EvidenceDrawer({ todo }: { todo: TodoItem }) {
  // Prefer the store (read-by-id); fall back to inline evidence for resilience.
  const ids = todo.evidence.map((e) => e.traceId).filter(Boolean) as string[];
  const stored = ids.length ? evidenceStore.getMany(ids) : [];
  const evidence: Evidence[] = stored.length === todo.evidence.length ? stored : todo.evidence;

  return (
    <div className="mt-3 animate-fade-in space-y-3 rounded-2xl bg-surface-2 p-3.5 shadow-[inset_0_0_0_1px_rgba(27,27,23,0.05)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 label text-ink-2">
          <Compass className="h-3.5 w-3.5" />
          Trace · Evidence
        </div>
        <ConfidenceMeter value={todo.confidence} />
      </div>

      <div className="rounded-xl bg-surface p-3 shadow-hair">
        <div className="label mb-1">Generated rationale</div>
        <p className="text-[13px] leading-relaxed text-ink-2">
          {todo.rationale || "Baseline ranking — no strong signals detected."}
        </p>
        <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-accent/25 px-2.5 py-1.5">
          <span className="label text-ink">Next</span>
          <span className="text-[13px] font-medium text-ink">{todo.suggestedAction}</span>
        </div>
        {todo.traceId && (
          <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-ink-4">
            <Hash className="h-3 w-3" />
            {todo.kind === "action" ? "action" : "todo"} trace {todo.traceId}
            {todo.parentTraceId && <span>· parent {todo.parentTraceId}</span>}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {evidence.map((e, i) => (
          <a
            key={e.traceId ?? i}
            href={e.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-xl bg-surface p-3 shadow-hair transition-shadow hover:shadow-card"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <SourceIcon type={e.sourceType} />
                <span className="truncate text-xs font-medium text-ink">{e.sourceTitle}</span>
                {e.kind && (
                  <span className="shrink-0 rounded-full bg-surface-3 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-3">
                    {e.kind}
                    {e.line ? ` · L${e.line}` : ""}
                  </span>
                )}
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink-4 transition group-hover:text-ink" />
            </div>
            <div className="flex gap-2">
              <Quote className="mt-0.5 h-3 w-3 shrink-0 text-ink-4" />
              <p className="font-mono text-[12px] leading-relaxed text-ink-2">{e.snippet}</p>
            </div>
            <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-ink-4">
              <span>{e.timestamp ? `captured ${timeAgo(e.timestamp)}` : ""}</span>
              {e.traceId && (
                <span className="flex items-center gap-1">
                  <Hash className="h-2.5 w-2.5" />
                  {e.traceId}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

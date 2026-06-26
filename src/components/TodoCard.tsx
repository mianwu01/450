import { useState } from "react";
import {
  CircleDot,
  GitPullRequest,
  ArrowUpRight,
  ChevronDown,
  Clock,
  CornerDownRight,
  Tag,
} from "lucide-react";
import type { TodoItem } from "@/types/domain";
import { PRIORITY_META } from "@/lib/presentation";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { EvidenceDrawer } from "./EvidenceDrawer";

export function TodoCard({
  todo,
  defaultOpen = false,
  compact = false,
  index = 0,
}: {
  todo: TodoItem;
  defaultOpen?: boolean;
  compact?: boolean;
  index?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = PRIORITY_META[todo.priority];
  const isPR = todo.sourceType === "pull_request";

  return (
    <article
      className={cn(
        "group rounded-2xl bg-surface p-4 shadow-hair transition-all duration-200 animate-fade-up",
        "hover:shadow-card hover:-translate-y-px",
      )}
      style={{ animationDelay: `${Math.min(index * 35, 350)}ms` }}
    >
      <div className="flex gap-3.5">
        <div
          className="mt-1 h-[calc(100%-0.5rem)] w-1 shrink-0 self-stretch rounded-full"
          style={{ backgroundColor: meta.hex }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <PriorityBadge priority={todo.priority} />
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-3">
                  {isPR ? (
                    <GitPullRequest className="h-3 w-3 text-p2" />
                  ) : (
                    <CircleDot className="h-3 w-3 text-mint" />
                  )}
                  #{todo.reference}
                </span>
                <StatusBadge status={todo.status} />
                {todo.kind === "action" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/25 px-2 py-0.5 text-[10px] font-medium text-ink">
                    <CornerDownRight className="h-2.5 w-2.5" /> action
                  </span>
                )}
                {todo.kind === "source" && !!todo.childCount && (
                  <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-ink-3">
                    {todo.childCount} action{todo.childCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <h3 className="truncate text-[15px] font-semibold tracking-tight text-ink">
                {todo.title}
              </h3>
            </div>
            <a
              href={todo.sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-3 text-ink-2 transition-colors hover:bg-ink hover:text-paper"
              title="Open on GitHub"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          {!compact && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-2">
              {todo.summary}
            </p>
          )}

          <div className="mt-2.5 flex items-start gap-1.5 text-[13px] text-ink-2">
            <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" />
            <span className="line-clamp-1 font-medium">{todo.suggestedAction}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {(todo.labels ?? []).slice(0, 3).map((l) => (
              <span key={l} className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-3">
                <Tag className="h-2.5 w-2.5" />
                {l}
              </span>
            ))}
            {todo.assignees && todo.assignees.length > 0 && (
              <div className="flex items-center -space-x-1.5">
                {todo.assignees.slice(0, 3).map((a) => (
                  <span
                    key={a}
                    title={a}
                    className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[9px] font-bold text-paper ring-2 ring-surface"
                  >
                    {a.slice(0, 2).toUpperCase()}
                  </span>
                ))}
              </div>
            )}
            <span className="num ml-auto flex items-center gap-1 font-mono text-[11px] text-ink-3">
              <Clock className="h-3 w-3" />
              {timeAgo(todo.updatedAt)}
            </span>
            <button
              onClick={() => setOpen((o) => !o)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                open ? "bg-ink text-paper" : "bg-surface-3 text-ink-2 hover:bg-surface-3/70",
              )}
              aria-expanded={open}
            >
              Evidence
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
            </button>
          </div>

          {open && <EvidenceDrawer todo={todo} />}
        </div>
      </div>
    </article>
  );
}

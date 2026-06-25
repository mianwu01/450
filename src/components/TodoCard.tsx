import { useState } from "react";
import {
  CircleDot,
  GitPullRequest,
  ExternalLink,
  ChevronDown,
  Clock,
  ArrowRight,
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
        "group glass-soft animate-fade-up p-4 transition-all duration-200",
        "hover:border-white/15 hover:bg-ink-700/50",
      )}
      style={{ animationDelay: `${Math.min(index * 35, 350)}ms` }}
    >
      {/* Left priority spine */}
      <div className="flex gap-3.5">
        <div
          className="mt-0.5 w-1 shrink-0 rounded-full"
          style={{ background: meta.hex, boxShadow: `0 0 12px ${meta.hex}66` }}
        />
        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <PriorityBadge priority={todo.priority} />
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  {isPR ? (
                    <GitPullRequest className="h-3 w-3 text-p2" />
                  ) : (
                    <CircleDot className="h-3 w-3 text-mint" />
                  )}
                  {isPR ? "PR" : "Issue"} #{todo.reference}
                </span>
                <StatusBadge status={todo.status} />
              </div>
              <h3 className="truncate text-[15px] font-semibold text-slate-100">
                {todo.title}
              </h3>
            </div>
            <a
              href={todo.sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn shrink-0 px-2.5 py-1.5"
              title="Open on GitHub"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {!compact && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
              {todo.summary}
            </p>
          )}

          {/* Suggested action teaser */}
          <div className="mt-2.5 flex items-start gap-1.5 text-[13px] text-slate-300">
            <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="line-clamp-1">{todo.suggestedAction}</span>
          </div>

          {/* Footer meta */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {(todo.labels ?? []).slice(0, 3).map((l) => (
              <span
                key={l}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500"
              >
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
                    className="grid h-5 w-5 place-items-center rounded-full border border-ink-700 bg-gradient-to-br from-accent/70 to-[#5b8cff]/70 text-[9px] font-bold text-white"
                  >
                    {a.slice(0, 2).toUpperCase()}
                  </span>
                ))}
              </div>
            )}
            <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="h-3 w-3" />
              {timeAgo(todo.updatedAt)}
            </span>
            <button
              onClick={() => setOpen((o) => !o)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                open
                  ? "bg-accent-soft text-accent"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
              )}
              aria-expanded={open}
            >
              Evidence
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
              />
            </button>
          </div>

          {open && <EvidenceDrawer todo={todo} />}
        </div>
      </div>
    </article>
  );
}

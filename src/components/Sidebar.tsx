import { LayoutDashboard, GitBranch, Plus, Radio, ShieldCheck } from "lucide-react";
import type { TodoPriority, HealthStatus } from "@/types/domain";
import { PRIORITY_META, PRIORITY_ORDER, HEALTH_META } from "@/lib/presentation";
import { cn } from "@/lib/utils";

export interface RepoTab {
  name: string;
  health: HealthStatus;
}

export function Sidebar({
  repos,
  activeRepo,
  onSelectRepo,
  onNewRepo,
  onHome,
  counts,
  total,
  priorityFilter,
  onPriorityFilter,
  mode,
}: {
  repos: RepoTab[];
  activeRepo: string | null;
  onSelectRepo: (name: string) => void;
  onNewRepo: () => void;
  onHome: () => void;
  counts: Record<TodoPriority, number>;
  total: number;
  priorityFilter: TodoPriority | null;
  onPriorityFilter: (p: TodoPriority | null) => void;
  mode: "mock" | "live";
}) {
  return (
    <aside className="hidden h-full w-[248px] shrink-0 animate-fade-in flex-col border-r border-line bg-paper-warm lg:flex">
      <button
        onClick={onHome}
        className="flex items-center gap-2.5 px-5 py-5 text-left transition-opacity hover:opacity-80"
        title="Home — start a new analysis"
      >
        <Mark />
        <div className="leading-tight">
          <div className="text-[14px] font-semibold tracking-tight text-ink">Workflow</div>
          <div className="label">Triage</div>
        </div>
      </button>

      <nav className="px-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-surface px-3 py-2.5 text-[13px] font-semibold text-ink shadow-hair">
          <LayoutDashboard className="h-[18px] w-[18px] text-ink" />
          Dashboard
        </div>
      </nav>

      <div className="mt-6 px-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="label">Repositories</span>
          <button
            onClick={onNewRepo}
            className="grid h-5 w-5 place-items-center rounded-md text-ink-3 hover:bg-surface-3 hover:text-ink"
            title="Analyze another repository"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-0.5">
          {repos.length === 0 && (
            <div className="px-2 py-3 text-[12px] text-ink-4">No repositories yet</div>
          )}
          {repos.map((r) => {
            const h = HEALTH_META[r.health];
            const on = r.name === activeRepo;
            return (
              <button
                key={r.name}
                onClick={() => onSelectRepo(r.name)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors",
                  on ? "bg-surface shadow-hair" : "hover:bg-surface-3",
                )}
              >
                <GitBranch className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate font-mono text-[12px]",
                    on ? "font-medium text-ink" : "text-ink-2",
                  )}
                >
                  {r.name.split("/").pop()}
                </span>
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: h.hex }}
                  title={h.label}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 px-3">
        <div className="mb-2 px-2 label">Priority breakdown</div>
        <div className="space-y-0.5">
          {PRIORITY_ORDER.map((p) => {
            const m = PRIORITY_META[p];
            const c = counts[p] ?? 0;
            const pct = total ? Math.round((c / total) * 100) : 0;
            const on = priorityFilter === p;
            return (
              <button
                key={p}
                onClick={() => onPriorityFilter(on ? null : p)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors",
                  on ? "bg-surface shadow-hair" : "hover:bg-surface-3",
                )}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: m.hex }}
                />
                <span className="w-6 text-left font-mono text-[12px] font-semibold" style={{ color: m.hex }}>
                  {p}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: m.hex }} />
                </div>
                <span className="num w-5 text-right font-mono text-[11px] text-ink-2">{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto px-5 py-5">
        <div className="rule mb-3" />
        <div className="flex items-center gap-1.5 text-[11px] text-ink-3">
          <Radio className={cn("h-3 w-3", mode === "live" ? "text-mint" : "text-ink-4")} />
          {mode === "live" ? "Live GitHub · read-only" : "Sample data · offline"}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-3">
          <ShieldCheck className="h-3 w-3 text-mint" />
          Read · summarize · rank
        </div>
      </div>
    </aside>
  );
}

function Mark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink">
      <span className="relative block h-4 w-4">
        <span className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-accent" />
        <span className="absolute bottom-[3px] left-0 h-[2px] w-full rounded bg-paper" />
      </span>
    </span>
  );
}

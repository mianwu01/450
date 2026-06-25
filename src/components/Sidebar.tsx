import {
  LayoutDashboard,
  GitBranch,
  Plus,
  Radio,
  ShieldCheck,
} from "lucide-react";
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
  counts: Record<TodoPriority, number>;
  total: number;
  priorityFilter: TodoPriority | null;
  onPriorityFilter: (p: TodoPriority | null) => void;
  mode: "mock" | "live";
}) {
  return (
    <aside className="hidden h-full w-[244px] shrink-0 flex-col border-r border-line bg-ink-900/50 backdrop-blur-xl lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-[#5b8cff] text-base shadow-glow">
          🛰️
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold text-slate-100">Workflow</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Command Center
          </div>
        </div>
      </div>

      <div className="hairline mx-3" />

      {/* Nav */}
      <nav className="px-3 py-3">
        <NavItem icon={LayoutDashboard} label="Triage Dashboard" active />
      </nav>

      {/* Repositories */}
      <div className="px-3">
        <div className="mb-1.5 flex items-center justify-between px-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Repositories
          </span>
          <button
            onClick={onNewRepo}
            className="grid h-5 w-5 place-items-center rounded-md text-slate-400 hover:bg-white/5 hover:text-slate-200"
            title="Analyze another repository"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-0.5">
          {repos.length === 0 && (
            <div className="px-2 py-3 text-[12px] text-slate-600">
              No repositories yet
            </div>
          )}
          {repos.map((r) => {
            const h = HEALTH_META[r.health];
            const on = r.name === activeRepo;
            return (
              <button
                key={r.name}
                onClick={() => onSelectRepo(r.name)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                  on ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
                )}
              >
                <GitBranch className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-[12px]",
                    on ? "font-medium text-slate-100" : "text-slate-400",
                  )}
                >
                  {r.name.split("/").pop()}
                </span>
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", h.dot)} title={h.label} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority breakdown */}
      <div className="mt-5 px-3">
        <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Priority breakdown
        </div>
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
                  "group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors",
                  on ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
                )}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: m.hex, boxShadow: `0 0 8px ${m.hex}` }}
                />
                <span className={cn("w-6 text-left text-[12px] font-semibold", m.text)}>
                  {p}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: m.hex }}
                  />
                </div>
                <span className="w-5 text-right text-[11px] tabular-nums text-slate-400">
                  {c}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto px-4 py-4">
        <div className="hairline mb-3" />
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Radio className={cn("h-3 w-3", mode === "live" ? "text-mint" : "text-slate-500")} />
          {mode === "live" ? "Live GitHub · read-only" : "Sample data · offline"}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="h-3 w-3 text-mint" />
          No write actions — read · summarize · rank
        </div>
        <div className="mt-2 text-[10px] text-slate-600">
          Nanobot · fast-API trace agent
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium",
        active
          ? "bg-accent-soft text-slate-100 ring-1 ring-accent/30"
          : "text-slate-400",
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-accent" : "text-slate-500")} />
      {label}
    </div>
  );
}

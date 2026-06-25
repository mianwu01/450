import { Target, ArrowRight } from "lucide-react";
import type { TodoItem } from "@/types/domain";
import { PRIORITY_META } from "@/lib/presentation";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

export function TodaysFocus({
  items,
  onOpen,
}: {
  items: TodoItem[];
  onOpen?: (id: string) => void;
}) {
  return (
    <section className="glass relative overflow-hidden p-5 animate-fade-up">
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
      <header className="relative mb-4 flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-[#5b8cff] shadow-glow">
          <Target className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Today's Focus</h2>
          <p className="text-[11px] text-slate-500">
            The highest-leverage tasks to clear first
          </p>
        </div>
      </header>

      <div className="relative grid grid-cols-1 gap-2.5 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((t, i) => {
          const m = PRIORITY_META[t.priority];
          return (
            <button
              key={t.id}
              onClick={() => onOpen?.(t.id)}
              className="group flex items-start gap-3 rounded-xl border border-line bg-white/[0.02] p-3 text-left transition-all hover:border-white/15 hover:bg-ink-700/60"
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-bold tabular-nums"
                style={{ backgroundColor: `${m.hex}22`, color: m.hex }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
                <h3 className="truncate text-[14px] font-semibold text-slate-100">
                  {t.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-400">
                  <ArrowRight className="h-3 w-3 shrink-0 text-accent" />
                  <span className="line-clamp-1">{t.suggestedAction}</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

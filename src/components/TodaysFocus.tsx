import { Target, CornerDownRight } from "lucide-react";
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
    <section className="card p-5 animate-fade-up">
      <header className="mb-4 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent">
          <Target className="h-[18px] w-[18px] text-accent-ink" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Today's Focus</h2>
          <p className="text-[12px] text-ink-3">The highest-leverage tasks to clear first</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((t, i) => {
          const m = PRIORITY_META[t.priority];
          return (
            <button
              key={t.id}
              onClick={() => onOpen?.(t.id)}
              className="group flex items-start gap-3 rounded-2xl bg-surface-2 p-3 text-left shadow-hair transition-all hover:bg-surface hover:shadow-card hover:-translate-y-px"
            >
              <span
                className="num grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-sm font-bold"
                style={{ backgroundColor: `${m.hex}22`, color: m.hex }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1.5">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
                <h3 className="truncate text-[14px] font-semibold tracking-tight text-ink">
                  {t.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-2">
                  <CornerDownRight className="h-3 w-3 shrink-0 text-ink-3" />
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

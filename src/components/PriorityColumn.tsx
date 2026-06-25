import type { TodoItem, TodoPriority } from "@/types/domain";
import { PRIORITY_META, PRIORITY_ORDER } from "@/lib/presentation";
import { cn } from "@/lib/utils";
import { TodoCard } from "./TodoCard";

function Column({
  priority,
  items,
}: {
  priority: TodoPriority;
  items: TodoItem[];
}) {
  const m = PRIORITY_META[priority];
  return (
    <div className="flex min-w-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: m.hex, boxShadow: `0 0 10px ${m.hex}` }}
          />
          <span className={cn("text-sm font-bold", m.text)}>{m.label}</span>
          <span className="text-xs text-slate-500">{m.name}</span>
        </div>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-400">
          {items.length}
        </span>
      </div>
      <div
        className={cn(
          "flex-1 space-y-2.5 rounded-2xl border border-line p-2.5",
          m.soft,
        )}
      >
        {items.length === 0 ? (
          <div className="px-3 py-8 text-center text-[12px] text-slate-600">
            Nothing here
          </div>
        ) : (
          items.map((t, i) => <TodoCard key={t.id} todo={t} index={i} compact />)
        )}
      </div>
    </div>
  );
}

export function PriorityBoard({
  groups,
}: {
  groups: Record<TodoPriority, TodoItem[]>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {PRIORITY_ORDER.map((p) => (
        <Column key={p} priority={p} items={groups[p]} />
      ))}
    </div>
  );
}

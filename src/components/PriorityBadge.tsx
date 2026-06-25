import type { TodoPriority } from "@/types/domain";
import { PRIORITY_META } from "@/lib/presentation";
import { cn } from "@/lib/utils";

export function PriorityBadge({
  priority,
  showName = false,
}: {
  priority: TodoPriority;
  showName?: boolean;
}) {
  const m = PRIORITY_META[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold",
        m.tint,
        m.onTint,
      )}
      title={`${m.label} · ${m.name} — ${m.description}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.hex }} />
      {m.label}
      {showName && <span className="font-sans font-medium opacity-70">{m.name}</span>}
    </span>
  );
}

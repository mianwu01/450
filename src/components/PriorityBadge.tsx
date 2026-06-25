import type { TodoPriority } from "@/types/domain";
import { PRIORITY_META } from "@/lib/presentation";
import { cn } from "@/lib/utils";

export function PriorityBadge({
  priority,
  size = "sm",
}: {
  priority: TodoPriority;
  size?: "sm" | "md";
}) {
  const m = PRIORITY_META[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-semibold tracking-wide",
        m.soft,
        m.text,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
      )}
      title={`${m.label} · ${m.name} — ${m.description}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: m.hex, boxShadow: `0 0 8px ${m.hex}` }}
      />
      {m.label}
    </span>
  );
}

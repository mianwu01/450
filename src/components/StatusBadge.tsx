import type { TodoStatus } from "@/types/domain";
import { STATUS_META } from "@/lib/presentation";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: TodoStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="chip">
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      <span className={m.text}>{m.label}</span>
    </span>
  );
}

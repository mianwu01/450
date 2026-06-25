import type { TodoStatus } from "@/types/domain";
import { STATUS_META } from "@/lib/presentation";

export function StatusBadge({ status }: { status: TodoStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-2">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.hex }} />
      {m.label}
    </span>
  );
}

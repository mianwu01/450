import type { RepoAnalysisResult, TodoItem, TodoPriority } from "@/types/domain";
import { daysSince } from "@/lib/format";

const STALE_DAYS = 30;

export function byPriority(todos: TodoItem[]): Record<TodoPriority, TodoItem[]> {
  return {
    P0: todos.filter((t) => t.priority === "P0"),
    P1: todos.filter((t) => t.priority === "P1"),
    P2: todos.filter((t) => t.priority === "P2"),
    P3: todos.filter((t) => t.priority === "P3"),
  };
}

/** Top tasks across the board — already globally sorted, just take the head. */
export function todaysFocus(todos: TodoItem[], n = 5): TodoItem[] {
  return todos.slice(0, n);
}

export function blockedOrDecisions(todos: TodoItem[]): TodoItem[] {
  return todos.filter(
    (t) => t.status === "blocked" || t.status === "needs_decision",
  );
}

export function reviewQueue(todos: TodoItem[]): TodoItem[] {
  return todos
    .filter((t) => t.sourceType === "pull_request")
    .sort((a, b) => rank(a) - rank(b));
}

export function staleItems(todos: TodoItem[]): TodoItem[] {
  return todos
    .filter((t) => daysSince(t.updatedAt) >= STALE_DAYS)
    .sort((a, b) => daysSince(b.updatedAt) - daysSince(a.updatedAt));
}

const PRIORITY_RANK: Record<TodoPriority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
function rank(t: TodoItem): number {
  return PRIORITY_RANK[t.priority];
}

// ── Filtering ─────────────────────────────────────────────────────────────────
export interface Filters {
  priorities: Set<TodoPriority>;
  sourceTypes: Set<"issue" | "pull_request">;
  statuses: Set<string>;
  assignee: string | null;
  label: string | null;
  query: string;
}

export function emptyFilters(): Filters {
  return {
    priorities: new Set(),
    sourceTypes: new Set(),
    statuses: new Set(),
    assignee: null,
    label: null,
    query: "",
  };
}

export function filtersActive(f: Filters): number {
  return (
    f.priorities.size +
    f.sourceTypes.size +
    f.statuses.size +
    (f.assignee ? 1 : 0) +
    (f.label ? 1 : 0) +
    (f.query.trim() ? 1 : 0)
  );
}

export function applyFilters(todos: TodoItem[], f: Filters): TodoItem[] {
  const q = f.query.trim().toLowerCase();
  return todos.filter((t) => {
    if (f.priorities.size && !f.priorities.has(t.priority)) return false;
    if (
      f.sourceTypes.size &&
      !(t.sourceType && f.sourceTypes.has(t.sourceType as "issue" | "pull_request"))
    )
      return false;
    if (f.statuses.size && !f.statuses.has(t.status)) return false;
    if (f.assignee && !(t.assignees ?? []).includes(f.assignee)) return false;
    if (f.label && !(t.labels ?? []).includes(f.label)) return false;
    if (q) {
      const hay = `${t.title} ${t.summary} ${t.rationale} ${(t.labels ?? []).join(
        " ",
      )}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function uniqueAssignees(result: RepoAnalysisResult): string[] {
  const s = new Set<string>();
  for (const t of result.todos) for (const a of t.assignees ?? []) s.add(a);
  return [...s].sort();
}

export function uniqueLabels(result: RepoAnalysisResult): string[] {
  const s = new Set<string>();
  for (const t of result.todos) for (const l of t.labels ?? []) s.add(l);
  return [...s].sort();
}

import { SlidersHorizontal, X, Search } from "lucide-react";
import type { Filters } from "@/logic/selectors";
import { filtersActive } from "@/logic/selectors";
import { PRIORITY_META, PRIORITY_ORDER, STATUS_META } from "@/lib/presentation";
import { cn } from "@/lib/utils";

const STATUS_KEYS = Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>;

export function DashboardFilters({
  filters,
  onChange,
  assignees,
  labels,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  assignees: string[];
  labels: string[];
}) {
  const active = filtersActive(filters);

  function toggle<T>(set: Set<T>, v: T): Set<T> {
    const next = new Set(set);
    next.has(v) ? next.delete(v) : next.add(v);
    return next;
  }

  return (
    <div className="card flex flex-wrap items-center gap-2 p-2.5">
      <div className="label flex items-center gap-1.5 pl-1 pr-1">
        <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
      </div>

      <div className="flex items-center gap-1.5 rounded-full bg-surface-3 px-3 py-1.5">
        <Search className="h-3.5 w-3.5 text-ink-3" />
        <input
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search todos…"
          className="w-32 bg-transparent text-[12px] text-ink placeholder:text-ink-4 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-1">
        {PRIORITY_ORDER.map((p) => {
          const on = filters.priorities.has(p);
          const m = PRIORITY_META[p];
          return (
            <button
              key={p}
              onClick={() => onChange({ ...filters, priorities: toggle(filters.priorities, p) })}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold transition-all",
                on ? `${m.tint} ${m.onTint}` : "bg-surface-3 text-ink-3 hover:text-ink",
              )}
            >
              {p}
            </button>
          );
        })}
      </div>

      <Segmented
        options={[
          { value: "issue", label: "Issues" },
          { value: "pull_request", label: "PRs" },
        ]}
        selected={filters.sourceTypes}
        onToggle={(v) =>
          onChange({
            ...filters,
            sourceTypes: toggle(filters.sourceTypes, v as "issue" | "pull_request"),
          })
        }
      />

      <Select
        placeholder="Status"
        value={[...filters.statuses][0] ?? ""}
        options={STATUS_KEYS.map((k) => ({ value: k, label: STATUS_META[k].label }))}
        onChange={(v) => onChange({ ...filters, statuses: v ? new Set([v]) : new Set() })}
      />
      <Select
        placeholder="Assignee"
        value={filters.assignee ?? ""}
        options={assignees.map((a) => ({ value: a, label: a }))}
        onChange={(v) => onChange({ ...filters, assignee: v || null })}
      />
      <Select
        placeholder="Label"
        value={filters.label ?? ""}
        options={labels.map((l) => ({ value: l, label: l }))}
        onChange={(v) => onChange({ ...filters, label: v || null })}
      />

      {active > 0 && (
        <button
          onClick={() =>
            onChange({
              priorities: new Set(),
              sourceTypes: new Set(),
              statuses: new Set(),
              assignee: null,
              label: null,
              query: "",
            })
          }
          className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-ink-2 hover:bg-surface-3"
        >
          <X className="h-3 w-3" /> Clear ({active})
        </button>
      )}
    </div>
  );
}

function Segmented<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: { value: T; label: string }[];
  selected: Set<T>;
  onToggle: (v: T) => void;
}) {
  return (
    <div className="flex items-center rounded-full bg-surface-3 p-0.5">
      {options.map((o) => {
        const on = selected.has(o.value);
        return (
          <button
            key={o.value}
            onClick={() => onToggle(o.value)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              on ? "bg-ink text-paper" : "text-ink-3 hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Select({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  if (!options.length) return null;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "rounded-full bg-surface-3 px-2.5 py-1.5 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        value ? "text-ink" : "text-ink-3",
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

import type { RepoAnalysisResult } from "@/types/domain";
import type { Filters } from "@/logic/selectors";
import { emptyFilters } from "@/logic/selectors";

// ─────────────────────────────────────────────────────────────────────────────
// Multi-repository workspace.
//
// Holds every analyzed repo at once — each with its own cached result and its
// own filter state — and persists to localStorage so the workspace is restored
// after a refresh. Filters carry Sets, so they're (de)serialized explicitly.
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkspaceEntry {
  result: RepoAnalysisResult;
  filters: Filters;
  addedAt: number;
}

export interface WorkspaceState {
  /** keyed by repoName (e.g. "owner/repo") */
  entries: Record<string, WorkspaceEntry>;
  /** repoName insertion order (oldest → newest) */
  order: string[];
  activeRepo: string | null;
}

const KEY = "awa.workspace.v1";
const MAX_REPOS = 8;

export function emptyWorkspace(): WorkspaceState {
  return { entries: {}, order: [], activeRepo: null };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function serFilters(f: Filters) {
  return {
    priorities: [...f.priorities],
    sourceTypes: [...f.sourceTypes],
    statuses: [...f.statuses],
    assignee: f.assignee,
    label: f.label,
    query: f.query,
  };
}
function deserFilters(o: any): Filters {
  const base = emptyFilters();
  if (!o) return base;
  return {
    priorities: new Set(o.priorities ?? []),
    sourceTypes: new Set(o.sourceTypes ?? []),
    statuses: new Set(o.statuses ?? []),
    assignee: o.assignee ?? null,
    label: o.label ?? null,
    query: o.query ?? "",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function loadWorkspace(): WorkspaceState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyWorkspace();
    const parsed = JSON.parse(raw);
    const entries: Record<string, WorkspaceEntry> = {};
    const order: string[] = Array.isArray(parsed.order) ? parsed.order : [];
    for (const name of order) {
      const e = parsed.entries?.[name];
      if (e?.result) {
        entries[name] = {
          result: e.result as RepoAnalysisResult,
          filters: deserFilters(e.filters),
          addedAt: e.addedAt ?? 0,
        };
      }
    }
    const validOrder = order.filter((n) => entries[n]);
    const activeRepo =
      parsed.activeRepo && entries[parsed.activeRepo]
        ? parsed.activeRepo
        : (validOrder[validOrder.length - 1] ?? null);
    return { entries, order: validOrder, activeRepo };
  } catch {
    return emptyWorkspace();
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  try {
    const entries: Record<string, unknown> = {};
    for (const [name, e] of Object.entries(state.entries)) {
      entries[name] = { result: e.result, filters: serFilters(e.filters), addedAt: e.addedAt };
    }
    localStorage.setItem(
      KEY,
      JSON.stringify({ entries, order: state.order, activeRepo: state.activeRepo }),
    );
  } catch {
    // Over quota / unavailable — keep the in-memory workspace for this session.
  }
}

/** Add (or refresh) a repo, make it active, and cap the workspace size. */
export function upsertRepo(
  state: WorkspaceState,
  result: RepoAnalysisResult,
  now: number,
): WorkspaceState {
  const name = result.repoName;
  const existing = state.entries[name];
  const entries = {
    ...state.entries,
    [name]: {
      result,
      filters: existing?.filters ?? emptyFilters(),
      addedAt: existing?.addedAt ?? now,
    },
  };
  let order = [...state.order.filter((n) => n !== name), name];
  // Evict the oldest beyond the cap.
  while (order.length > MAX_REPOS) {
    const drop = order.shift()!;
    delete entries[drop];
  }
  return { entries, order, activeRepo: name };
}

export function removeRepo(state: WorkspaceState, name: string): WorkspaceState {
  const entries = { ...state.entries };
  delete entries[name];
  const order = state.order.filter((n) => n !== name);
  const activeRepo =
    state.activeRepo === name ? (order[order.length - 1] ?? null) : state.activeRepo;
  return { entries, order, activeRepo };
}

export function setFiltersFor(
  state: WorkspaceState,
  name: string,
  filters: Filters,
): WorkspaceState {
  const e = state.entries[name];
  if (!e) return state;
  return { ...state, entries: { ...state.entries, [name]: { ...e, filters } } };
}

export function patchResult(
  state: WorkspaceState,
  name: string,
  patch: Partial<RepoAnalysisResult>,
): WorkspaceState {
  const e = state.entries[name];
  if (!e) return state;
  return {
    ...state,
    entries: { ...state.entries, [name]: { ...e, result: { ...e.result, ...patch } } },
  };
}

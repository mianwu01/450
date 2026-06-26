import type { Evidence } from "@/types/domain";

// ─────────────────────────────────────────────────────────────────────────────
// Evidence store — a lightweight, interface-based store keyed by trace ID.
//
// The dashboard writes every todo's evidence here during analysis and the
// Evidence drawer reads it back *by ID*. It is deliberately behind an interface
// so it can later be swapped for Nanobot's real evidence store through one seam
// (`evidenceStore`) with no UI changes. The default impl persists to
// localStorage (with an in-memory fallback) so traces survive a refresh.
// ─────────────────────────────────────────────────────────────────────────────

export interface EvidenceRecord extends Evidence {
  /** Required here — the stable key. */
  traceId: string;
  /** Owning todo's trace id. */
  todoTraceId?: string;
  /** Repo this evidence belongs to (enables per-repo eviction). */
  repoName?: string;
}

export interface EvidenceStore {
  put(records: EvidenceRecord[]): void;
  get(traceId: string): EvidenceRecord | undefined;
  getMany(traceIds: string[]): EvidenceRecord[];
  all(): EvidenceRecord[];
  removeRepo(repoName: string): void;
  clear(): void;
}

const KEY = "awa.evidence.v1";

function createLocalEvidenceStore(): EvidenceStore {
  // In-memory mirror; the source of truth is localStorage when available.
  let mem: Record<string, EvidenceRecord> = load();

  function load(): Record<string, EvidenceRecord> {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Record<string, EvidenceRecord>) : {};
    } catch {
      return {};
    }
  }
  function flush(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(mem));
    } catch {
      /* over quota / unavailable — the in-memory mirror still serves this session */
    }
  }

  return {
    put(records) {
      for (const r of records) if (r.traceId) mem[r.traceId] = r;
      flush();
    },
    get(traceId) {
      return mem[traceId];
    },
    getMany(ids) {
      return ids.map((id) => mem[id]).filter(Boolean) as EvidenceRecord[];
    },
    all() {
      return Object.values(mem);
    },
    removeRepo(repoName) {
      mem = Object.fromEntries(
        Object.entries(mem).filter(([, r]) => r.repoName !== repoName),
      );
      flush();
    },
    clear() {
      mem = {};
      flush();
    },
  };
}

/** The active store. Swap this assignment for a Nanobot-backed store later. */
export const evidenceStore: EvidenceStore = createLocalEvidenceStore();

/** Flatten a result's todos into evidence records for the store. */
export function collectEvidence(
  repoName: string,
  todos: { traceId?: string; evidence: Evidence[] }[],
): EvidenceRecord[] {
  const out: EvidenceRecord[] = [];
  for (const t of todos) {
    for (const e of t.evidence) {
      if (!e.traceId) continue;
      out.push({ ...e, traceId: e.traceId, todoTraceId: t.traceId, repoName });
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stable, deterministic trace IDs.
//
// IDs are content-addressed (a hash of repo + source type + number + extraction
// position), so the *same* source produces the *same* ID across refreshes and
// re-analyses. They flow intake → extraction → display → export, and key the
// evidence store. No randomness, so they survive reloads and are diff-friendly.
// ─────────────────────────────────────────────────────────────────────────────

import type { TodoSourceType } from "@/types/domain";

/** FNV-1a (32-bit) → base36. Tiny, dependency-free, stable. */
export function hash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // unsigned, base36, zero-padded for a tidy fixed-ish width
  return (h >>> 0).toString(36).padStart(7, "0");
}

export function traceKey(parts: Array<string | number | undefined>): string {
  return parts.map((p) => (p == null ? "" : String(p))).join("·");
}

/** Trace ID for a todo (issue/PR card or an extracted action). */
export function todoTraceId(
  repo: string,
  sourceType: TodoSourceType,
  reference: number | undefined,
  position = 0,
): string {
  return `t_${hash(traceKey([repo, sourceType, reference, position]))}`;
}

/** Trace ID for one piece of evidence under a todo. */
export function evidenceTraceId(todoId: string, position: number, kind = "ev"): string {
  return `e_${hash(traceKey([todoId, kind, position]))}`;
}

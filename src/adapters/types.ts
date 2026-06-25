import type { IntakeBundle } from "@/types/domain";

export interface RepoTarget {
  owner: string;
  repo: string;
}

/**
 * A GitHubAdapter is the single seam between the dashboard and "where the data
 * comes from". The mock adapter ships curated data; the live adapter hits the
 * public GitHub REST API. A real Nanobot `gh`-backed tool can implement this
 * same interface later with zero UI changes.
 */
export interface GitHubAdapter {
  id: string;
  label: string;
  description: string;
  /** True when this adapter never touches the network (safe for offline demos). */
  offline: boolean;
  fetchIntake(target: RepoTarget, signal?: AbortSignal): Promise<IntakeBundle>;
}

export type AnalysisErrorKind =
  | "invalid_repo"
  | "not_found"
  | "rate_limit"
  | "private"
  | "network"
  | "empty"
  | "timeout"
  | "unknown";

export class AnalysisError extends Error {
  kind: AnalysisErrorKind;
  detail?: string;
  constructor(kind: AnalysisErrorKind, message: string, detail?: string) {
    super(message);
    this.name = "AnalysisError";
    this.kind = kind;
    this.detail = detail;
  }
}

import type { RepoAnalysisResult } from "@/types/domain";
import { analyze } from "@/logic/analyze";
import { parseRepoInput } from "@/lib/utils";
import { mockAdapter } from "./mockAdapter";
import { liveAdapter } from "./liveAdapter";
import { AnalysisError } from "./types";
import type { GitHubAdapter } from "./types";

export { AnalysisError } from "./types";
export type { GitHubAdapter, AnalysisErrorKind } from "./types";

export type AdapterMode = "mock" | "live";

export const ADAPTERS: Record<AdapterMode, GitHubAdapter> = {
  mock: mockAdapter,
  live: liveAdapter,
};

// The staged pipeline shown in the loading UI. Mirrors the conceptual flow:
// source intake → task extraction → priority ranking → evidence store.
export const ANALYSIS_STEPS = [
  { id: "meta", label: "Fetching repository metadata" },
  { id: "issues", label: "Reading open issues" },
  { id: "prs", label: "Reading pull requests" },
  { id: "extract", label: "Extracting actionable todos" },
  { id: "rank", label: "Ranking priorities (P0–P3)" },
  { id: "trace", label: "Building trace & evidence log" },
] as const;

export type StepId = (typeof ANALYSIS_STEPS)[number]["id"];
export type StepStatus = "pending" | "active" | "done";

export interface RunOptions {
  mode: AdapterMode;
  onStep?: (id: StepId, status: StepStatus) => void;
  signal?: AbortSignal;
}

const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * End-to-end: parse input → adapter intake → analyze → result, while emitting
 * staged progress for the loading UI. Throws AnalysisError for polished states.
 */
export async function runAnalysis(
  input: string,
  { mode, onStep, signal }: RunOptions,
): Promise<RepoAnalysisResult> {
  const target = parseRepoInput(input);
  if (!target) {
    throw new AnalysisError(
      "invalid_repo",
      "That doesn't look like a repository.",
      "Use owner/repo (e.g. hkuds/nanobot) or a github.com URL.",
    );
  }

  const adapter = ADAPTERS[mode];
  const step = (id: StepId, s: StepStatus) => onStep?.(id, s);

  step("meta", "active");
  const bundle = await adapter.fetchIntake(target, signal);
  step("meta", "done");

  // Surface the intake substeps for a richer loading sequence.
  step("issues", "active");
  await tick(180);
  step("issues", "done");
  step("prs", "active");
  await tick(180);
  step("prs", "done");

  if (bundle.issues.length === 0 && bundle.pullRequests.length === 0) {
    throw new AnalysisError(
      "empty",
      "No open issues or pull requests.",
      `${bundle.repo.fullName} has a clean queue — nothing to triage right now.`,
    );
  }

  step("extract", "active");
  await tick(160);
  const result = analyze(bundle);
  step("extract", "done");

  step("rank", "active");
  await tick(160);
  step("rank", "done");

  step("trace", "active");
  await tick(140);
  step("trace", "done");

  return result;
}

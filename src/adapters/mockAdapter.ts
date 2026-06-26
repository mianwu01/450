import type { IntakeBundle } from "@/types/domain";
import { mockBundleFor } from "@/data/mockData";
import type { GitHubAdapter, RepoTarget } from "./types";

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

/**
 * Offline adapter backed by curated data. Adds a small artificial latency so
 * the staged loading sequence is visible in the demo.
 */
export const mockAdapter: GitHubAdapter = {
  id: "mock",
  label: "Sample data",
  description: "Curated offline dataset — always works, ideal for demos.",
  offline: true,
  async fetchIntake(target: RepoTarget, signal?: AbortSignal): Promise<IntakeBundle> {
    await sleep(650, signal);
    const bundle = mockBundleFor(target.owner, target.repo);
    // Curated data is fully populated (comments, review/CI), so report it as
    // enriched — no "needs a token" hints in Sample mode.
    return {
      ...bundle,
      meta: { live: false, tokenPresent: true, reviewCi: true, comments: true },
    };
  },
};

import type {
  CheckState,
  IntakeBundle,
  RawIssue,
  RawPullRequest,
  RawRepo,
  ReviewState,
} from "@/types/domain";
import { getToken } from "@/lib/token";
import { AnalysisError } from "./types";
import type { GitHubAdapter, RepoTarget } from "./types";

const API = "https://api.github.com";

// Cap how many PRs we enrich with extra per-PR calls, so even a busy repo with a
// token stays well within budget.
const MAX_PR_ENRICH = 20;
// Concurrency for enrichment fan-out.
const ENRICH_POOL = 5;

function authHeaders(): Record<string, string> {
  const token = getToken();
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function gh<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { headers: authHeaders(), signal });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new AnalysisError("network", "Could not reach GitHub.", String(e));
  }

  if (res.status === 404) {
    throw new AnalysisError(
      "not_found",
      "Repository not found.",
      getToken()
        ? "It may be renamed or mistyped, or the token lacks access."
        : "It may be private, renamed, or mistyped. Add a token for private repos.",
    );
  }
  if (res.status === 401) {
    throw new AnalysisError(
      "private",
      "GitHub rejected the token.",
      "The token is invalid or expired — re-enter it in Settings.",
    );
  }
  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining === "0") {
      const reset = res.headers.get("x-ratelimit-reset");
      const when = reset
        ? new Date(Number(reset) * 1000).toLocaleTimeString()
        : "soon";
      throw new AnalysisError(
        "rate_limit",
        "GitHub API rate limit reached.",
        getToken()
          ? `Your token's hourly limit is exhausted. Resets around ${when}.`
          : `Unauthenticated requests are limited to 60/hour (resets ~${when}). Add a personal access token in Settings to get 5,000/hour.`,
      );
    }
    throw new AnalysisError(
      "private",
      "Access forbidden.",
      "This repo may be private — add a token with access in Settings.",
    );
  }
  if (!res.ok) {
    throw new AnalysisError("unknown", `GitHub returned ${res.status}.`);
  }
  return (await res.json()) as T;
}

// Best-effort GET that resolves to null on any failure (used for enrichment).
async function ghSoft<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  try {
    return await gh<T>(path, signal);
  } catch {
    return null;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapLabels(labels: any[]): string[] {
  return (labels ?? []).map((l) => (typeof l === "string" ? l : l.name));
}

function mapIssue(raw: any): RawIssue {
  return {
    number: raw.number,
    title: raw.title,
    body: raw.body ?? "",
    htmlUrl: raw.html_url,
    state: raw.state,
    labels: mapLabels(raw.labels),
    assignees: (raw.assignees ?? []).map((a: any) => a.login),
    milestone: raw.milestone?.title,
    comments: raw.comments ?? 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    authorLogin: raw.user?.login,
  };
}

function mapPull(raw: any): RawPullRequest & { _headSha?: string } {
  const requested = (raw.requested_reviewers ?? []).map((r: any) => r.login);
  let reviewState: ReviewState = "none";
  if (!raw.draft && requested.length > 0) reviewState = "review_required";
  return {
    ...mapIssue(raw),
    isDraft: !!raw.draft,
    reviewState,
    checkState: "none",
    additions: raw.additions,
    deletions: raw.deletions,
    changedFiles: raw.changed_files,
    requestedReviewers: requested,
    _headSha: raw.head?.sha,
  };
}

// Aggregate the latest review per reviewer into a single state.
function reviewStateFrom(reviews: any[], fallback: ReviewState): ReviewState {
  if (!reviews?.length) return fallback;
  const latestByUser = new Map<string, string>();
  for (const r of reviews) {
    const login = r.user?.login;
    if (!login) continue;
    if (r.state === "COMMENTED") continue; // comments don't change the gate
    latestByUser.set(login, r.state); // reviews are chronological → last wins
  }
  const states = [...latestByUser.values()];
  if (states.includes("CHANGES_REQUESTED")) return "changes_requested";
  if (states.includes("APPROVED")) return "approved";
  return fallback;
}

function checkStateFrom(checkRuns: any[], statuses: any): CheckState {
  const runs = checkRuns ?? [];
  const combined = statuses?.state as string | undefined; // success|failure|pending
  if (!runs.length && !combined) return "none";
  const concl = runs.map((r) => r.conclusion);
  const anyFail =
    concl.some((c) => ["failure", "timed_out", "cancelled", "action_required"].includes(c)) ||
    combined === "failure";
  if (anyFail) return "failing";
  const anyPending =
    runs.some((r) => r.status !== "completed") || combined === "pending";
  if (anyPending) return "pending";
  return "passing";
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function enrichPulls(
  base: string,
  pulls: Array<RawPullRequest & { _headSha?: string }>,
  signal?: AbortSignal,
): Promise<void> {
  const targets = pulls.slice(0, MAX_PR_ENRICH);
  let cursor = 0;
  async function worker() {
    while (cursor < targets.length) {
      const pr = targets[cursor++];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reviews = await ghSoft<any[]>(
        `${base}/pulls/${pr.number}/reviews?per_page=100`,
        signal,
      );
      if (reviews) pr.reviewState = reviewStateFrom(reviews, pr.reviewState);
      if (pr._headSha) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checks = await ghSoft<any>(
          `${base}/commits/${pr._headSha}/check-runs`,
          signal,
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = await ghSoft<any>(
          `${base}/commits/${pr._headSha}/status`,
          signal,
        );
        pr.checkState = checkStateFrom(checks?.check_runs ?? [], status);
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(ENRICH_POOL, targets.length) }, worker),
  );
}

export const liveAdapter: GitHubAdapter = {
  id: "live",
  label: "Live GitHub",
  description: "Read-only fetch from the public GitHub REST API.",
  offline: false,
  async fetchIntake(target: RepoTarget, signal?: AbortSignal): Promise<IntakeBundle> {
    const { owner, repo } = target;
    const base = `/repos/${owner}/${repo}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repoRaw = await gh<any>(base, signal);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const issuesRaw = await gh<any[]>(
      `${base}/issues?state=open&per_page=50&sort=updated`,
      signal,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pullsRaw = await gh<any[]>(
      `${base}/pulls?state=open&per_page=30&sort=updated`,
      signal,
    );

    const repoMeta: RawRepo = {
      fullName: repoRaw.full_name,
      htmlUrl: repoRaw.html_url,
      description: repoRaw.description ?? undefined,
      language: repoRaw.language ?? undefined,
      stars: repoRaw.stargazers_count,
      forks: repoRaw.forks_count,
      openIssuesAndPrs: repoRaw.open_issues_count,
      pushedAt: repoRaw.pushed_at,
    };

    const issues = issuesRaw.filter((i) => !i.pull_request).map(mapIssue);
    const pullRequests = pullsRaw.map(mapPull);

    // When we have a token (and therefore budget), fill in real review + CI
    // status per PR. Best-effort: any failure leaves the light-path defaults.
    if (getToken() && pullRequests.length) {
      await enrichPulls(base, pullRequests, signal);
    }

    // Strip the internal _headSha before handing off.
    const cleanedPulls: RawPullRequest[] = pullRequests.map(
      ({ _headSha, ...pr }) => {
        void _headSha;
        return pr;
      },
    );

    return { repo: repoMeta, issues, pullRequests: cleanedPulls };
  },
};

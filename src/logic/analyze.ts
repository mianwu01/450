import type {
  Evidence,
  HealthStatus,
  IntakeBundle,
  RawIssue,
  RawPullRequest,
  RepoAnalysisResult,
  TodoItem,
  TodoPriority,
  TodoStatus,
} from "@/types/domain";
import { daysSince } from "@/lib/format";
import { clamp } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic task-extraction + prioritization pipeline.
//
// This is intentionally a transparent, rule-based ranker (the "deterministic
// placeholder" the brief asks for). Every score contribution is recorded as a
// human-readable reason, so each todo can explain *why this matters* and *why
// this priority* — satisfying the traceability CTQ. Swapping in an LLM judge
// later means replacing `scoreItem` while keeping this signature.
// ─────────────────────────────────────────────────────────────────────────────

const STALE_DAYS = 30;

const has = (labels: string[], ...needles: string[]) =>
  labels.some((l) => needles.includes(l.toLowerCase()));

interface Scored {
  score: number;
  reasons: string[];
}

function snippet(text: string | undefined, max = 220): string {
  if (!text) return "";
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

function bucket(score: number): TodoPriority {
  if (score >= 80) return "P0";
  if (score >= 55) return "P1";
  if (score >= 30) return "P2";
  return "P3";
}

function confidenceFrom(reasons: string[], item: RawIssue): number {
  // More explicit signal (labels, assignment, recent activity) → higher confidence.
  let c = 0.55 + Math.min(0.3, reasons.length * 0.06);
  if (item.labels.length) c += 0.05;
  if (item.assignees.length) c += 0.05;
  if (daysSince(item.updatedAt) < 7) c += 0.05;
  return clamp(Number(c.toFixed(2)), 0.4, 0.98);
}

// ── Issues ──────────────────────────────────────────────────────────────────
function scoreIssue(issue: RawIssue, viewer?: string): Scored {
  const reasons: string[] = [];
  let score = 18; // baseline for an open issue

  const labels = issue.labels.map((l) => l.toLowerCase());
  const stale = daysSince(issue.updatedAt) >= STALE_DAYS;

  if (has(labels, "release-blocker", "blocker")) {
    score += 65;
    reasons.push("Tagged as a release blocker — gates the milestone.");
  }
  if (has(labels, "ci") && has(labels, "bug")) {
    score += 40;
    reasons.push("CI-related bug — can keep the pipeline red for everyone.");
  }
  if (has(labels, "bug") && !stale) {
    score += 22;
    reasons.push("Active bug report.");
  }
  if (has(labels, "needs-decision") || has(labels, "discussion")) {
    score += 16;
    reasons.push("Needs a decision before dependent work can proceed.");
  }
  if (viewer && issue.assignees.includes(viewer)) {
    score += 24;
    reasons.push("Assigned to you.");
  }
  if (issue.milestone) {
    score += 10;
    reasons.push(`Scoped to milestone “${issue.milestone}”.`);
  }
  if (issue.comments >= 5) {
    score += 6;
    reasons.push(`High discussion volume (${issue.comments} comments).`);
  }
  if (has(labels, "documentation")) {
    score -= 14;
    reasons.push("Documentation-only — lower urgency.");
  }
  if (has(labels, "idea", "research", "exploratory", "wontfix-for-now")) {
    score -= 20;
    reasons.push("Exploratory / out of current scope.");
  }
  if (has(labels, "tech-debt", "cleanup", "chore")) {
    score -= 6;
    reasons.push("Cleanup / tech-debt — useful but not urgent.");
  }
  if (stale) {
    score -= 16;
    reasons.push(`Stale — no activity for ${daysSince(issue.updatedAt)} days.`);
  }

  return { score: clamp(score, 2, 100), reasons };
}

function issueStatus(issue: RawIssue): TodoStatus {
  const labels = issue.labels.map((l) => l.toLowerCase());
  if (has(labels, "blocker", "release-blocker")) return "blocked";
  if (has(labels, "needs-decision", "discussion")) return "needs_decision";
  if (issue.assignees.length === 0 && issue.labels.length === 0)
    return "needs_triage";
  if (has(labels, "bug", "enhancement", "ci")) return "needs_implementation";
  return "needs_triage";
}

function issueAction(issue: RawIssue, status: TodoStatus): string {
  const labels = issue.labels.map((l) => l.toLowerCase());
  if (has(labels, "release-blocker", "blocker"))
    return "Triage and unblock before tagging the release.";
  if (status === "needs_decision")
    return "Drive the decision to a conclusion and record the rationale.";
  if (has(labels, "ci")) return "Reproduce, fix the CI failure, and confirm a green run.";
  if (has(labels, "bug")) return "Reproduce, then scope a fix or assign an owner.";
  if (has(labels, "documentation")) return "Draft the docs when convenient.";
  if (status === "needs_triage") return "Triage: add labels, an owner, and a milestone.";
  return "Scope the work and pick up when capacity allows.";
}

// ── Pull requests ─────────────────────────────────────────────────────────────
function scorePR(pr: RawPullRequest, viewer?: string): Scored {
  const reasons: string[] = [];
  let score = 28; // PRs carry more momentum than raw issues
  const labels = pr.labels.map((l) => l.toLowerCase());
  const stale = daysSince(pr.updatedAt) >= STALE_DAYS;

  if (pr.isDraft) {
    score -= 14;
    reasons.push("Draft — not yet ready for review.");
  }
  if (has(labels, "hotfix") || has(labels, "release-blocker")) {
    score += 55;
    reasons.push("Hotfix / release-critical PR.");
  }
  if (pr.checkState === "failing") {
    score += 26;
    reasons.push("CI checks are failing — needs attention before merge.");
  }
  if (pr.reviewState === "review_required" && !pr.isDraft) {
    score += 30;
    reasons.push("Review required — blocking the author from merging.");
  }
  if (pr.reviewState === "changes_requested") {
    score += 24;
    reasons.push("Changes requested — author must respond.");
  }
  if (viewer && (pr.requestedReviewers ?? []).includes(viewer)) {
    score += 22;
    reasons.push("You are a requested reviewer.");
  }
  if (pr.reviewState === "approved" && pr.checkState === "passing") {
    score += 8;
    reasons.push("Approved and green — ready to merge.");
  }
  if (viewer && pr.assignees.includes(viewer)) {
    score += 10;
    reasons.push("Assigned to you.");
  }
  if (pr.milestone) {
    score += 8;
    reasons.push(`Scoped to milestone “${pr.milestone}”.`);
  }
  if (has(labels, "documentation")) {
    score -= 16;
    reasons.push("Documentation-only PR.");
  }
  if (stale) {
    score -= 18;
    reasons.push(`Stale — untouched for ${daysSince(pr.updatedAt)} days.`);
  }
  return { score: clamp(score, 2, 100), reasons };
}

function prStatus(pr: RawPullRequest): TodoStatus {
  if (pr.isDraft) return "needs_implementation";
  if (pr.checkState === "failing") return "blocked";
  if (pr.reviewState === "changes_requested") return "needs_implementation";
  if (pr.reviewState === "review_required") return "needs_review";
  if (pr.reviewState === "approved") return "waiting";
  return "needs_review";
}

function prAction(pr: RawPullRequest, status: TodoStatus): string {
  if (pr.isDraft) return "Finish the implementation, then mark ready for review.";
  if (pr.checkState === "failing") return "Fix failing checks before requesting review.";
  if (status === "needs_review") return "Review the diff and approve or request changes.";
  if (status === "needs_implementation")
    return "Address the requested changes and re-request review.";
  if (status === "waiting") return "Merge once dependencies are green.";
  return "Move the review forward.";
}

// ── Extraction ────────────────────────────────────────────────────────────────
function issueToTodo(issue: RawIssue, viewer?: string): TodoItem {
  const { score, reasons } = scoreIssue(issue, viewer);
  const status = issueStatus(issue);
  const evidence: Evidence[] = [
    {
      sourceType: "issue",
      sourceTitle: `#${issue.number} ${issue.title}`,
      sourceUrl: issue.htmlUrl,
      snippet: snippet(issue.body) || "(no description provided)",
      timestamp: issue.updatedAt,
    },
  ];
  if (issue.lastComment) {
    evidence.push({
      sourceType: "issue",
      sourceTitle: `Latest comment on #${issue.number}`,
      sourceUrl: issue.htmlUrl,
      snippet: snippet(issue.lastComment),
      timestamp: issue.updatedAt,
    });
  }

  return {
    id: `issue-${issue.number}`,
    title: issue.title,
    summary: snippet(issue.body, 140) || "No description provided.",
    priority: bucket(score),
    status,
    suggestedAction: issueAction(issue, status),
    rationale: reasons.join(" "),
    confidence: confidenceFrom(reasons, issue),
    labels: issue.labels,
    assignees: issue.assignees,
    updatedAt: issue.updatedAt,
    sourceUrl: issue.htmlUrl,
    sourceType: "issue",
    reference: issue.number,
    evidence,
  };
}

function prToTodo(pr: RawPullRequest, viewer?: string): TodoItem {
  const { score, reasons } = scorePR(pr, viewer);
  const status = prStatus(pr);
  const meta = `+${pr.additions ?? 0} −${pr.deletions ?? 0} across ${
    pr.changedFiles ?? 0
  } files · checks ${pr.checkState} · review ${pr.reviewState.replace("_", " ")}`;
  const evidence: Evidence[] = [
    {
      sourceType: "pull_request",
      sourceTitle: `#${pr.number} ${pr.title}`,
      sourceUrl: pr.htmlUrl,
      snippet: snippet(pr.body) || "(no description provided)",
      timestamp: pr.updatedAt,
    },
    {
      sourceType: "pull_request",
      sourceTitle: "Review & check status",
      sourceUrl: pr.htmlUrl,
      snippet: meta,
      timestamp: pr.updatedAt,
    },
  ];
  if (pr.lastComment) {
    evidence.push({
      sourceType: "pull_request",
      sourceTitle: `Latest comment on #${pr.number}`,
      sourceUrl: pr.htmlUrl,
      snippet: snippet(pr.lastComment),
      timestamp: pr.updatedAt,
    });
  }

  return {
    id: `pr-${pr.number}`,
    title: pr.title,
    summary: snippet(pr.body, 140) || "No description provided.",
    priority: bucket(score),
    status,
    suggestedAction: prAction(pr, status),
    rationale: reasons.join(" "),
    confidence: confidenceFrom(reasons, pr),
    labels: pr.labels,
    assignees: pr.assignees,
    updatedAt: pr.updatedAt,
    sourceUrl: pr.htmlUrl,
    sourceType: "pull_request",
    reference: pr.number,
    evidence,
  };
}

const PRIORITY_RANK: Record<TodoPriority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

export function extractTodos(bundle: IntakeBundle): TodoItem[] {
  const todos = [
    ...bundle.issues.map((i) => issueToTodo(i, bundle.viewerLogin)),
    ...bundle.pullRequests.map((p) => prToTodo(p, bundle.viewerLogin)),
  ];
  return todos.sort((a, b) => {
    const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (byPriority !== 0) return byPriority;
    return (
      new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
    );
  });
}

// ── Health ────────────────────────────────────────────────────────────────────
export function deriveHealth(bundle: IntakeBundle, todos: TodoItem[]): HealthStatus {
  const p0 = todos.filter((t) => t.priority === "P0").length;
  const failingPRs = bundle.pullRequests.filter(
    (p) => p.checkState === "failing",
  ).length;
  const ciBlocked = bundle.issues.some(
    (i) =>
      i.labels.map((l) => l.toLowerCase()).includes("blocker") &&
      i.labels.map((l) => l.toLowerCase()).includes("ci"),
  );
  const recentPush = daysSince(bundle.repo.pushedAt) <= 1;
  const openVolume = bundle.issues.length + bundle.pullRequests.length;

  if (ciBlocked || p0 >= 2) return "Blocked";
  if (p0 === 1 || failingPRs >= 1) return "Needs Attention";
  if (recentPush && openVolume >= 12) return "High Activity";
  return "Stable";
}

// ── Top-level pipeline ────────────────────────────────────────────────────────
export function analyze(
  bundle: IntakeBundle,
  generatedAt: string = new Date().toISOString(),
): RepoAnalysisResult {
  const todos = extractTodos(bundle);
  const openPRs = bundle.pullRequests.length;
  const openIssues = bundle.issues.length;
  return {
    repoName: bundle.repo.fullName,
    repoUrl: bundle.repo.htmlUrl,
    description: bundle.repo.description,
    language: bundle.repo.language,
    stars: bundle.repo.stars,
    forks: bundle.repo.forks,
    openIssues,
    openPRs,
    lastUpdated: bundle.repo.pushedAt,
    healthStatus: deriveHealth(bundle, todos),
    generatedAt,
    todos,
  };
}

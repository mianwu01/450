import type {
  Evidence,
  EvidenceKind,
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
import { todoTraceId, evidenceTraceId } from "@/lib/trace";

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

const PRIORITY_RANK: Record<TodoPriority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
const PRIORITY_ORDER: TodoPriority[] = ["P0", "P1", "P2", "P3"];
/** Cap extracted child actions per source so a checklist-heavy issue can't flood. */
const MAX_ACTIONS = 6;

/** Assign stable trace ids (+ default kinds) to a todo's evidence in place. */
function withEvidenceIds(todoId: string, evidence: Evidence[]): Evidence[] {
  return evidence.map((e, i) => ({
    ...e,
    kind: e.kind ?? "body",
    traceId: e.traceId ?? evidenceTraceId(todoId, i, e.kind ?? "ev"),
  }));
}

// ── Source cards (the whole issue / PR) ───────────────────────────────────────
function issueToTodo(repo: string, issue: RawIssue, viewer?: string): TodoItem {
  const { score, reasons } = scoreIssue(issue, viewer);
  const status = issueStatus(issue);
  const traceId = todoTraceId(repo, "issue", issue.number, 0);
  const evidence: Evidence[] = [
    {
      sourceType: "issue",
      sourceTitle: `#${issue.number} ${issue.title}`,
      sourceUrl: issue.htmlUrl,
      snippet: snippet(issue.body) || "(no description provided)",
      timestamp: issue.updatedAt,
      kind: "body",
    },
  ];
  if (issue.lastComment) {
    evidence.push({
      sourceType: "issue",
      sourceTitle: `Latest comment on #${issue.number}`,
      sourceUrl: issue.htmlUrl,
      snippet: snippet(issue.lastComment),
      timestamp: issue.updatedAt,
      kind: "comment",
    });
  }

  return {
    id: `issue-${issue.number}`,
    traceId,
    kind: "source",
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
    evidence: withEvidenceIds(traceId, evidence),
  };
}

function prToTodo(
  repo: string,
  pr: RawPullRequest,
  viewer?: string,
  enriched = true,
): TodoItem {
  const { score, reasons } = scorePR(pr, viewer);
  const status = prStatus(pr);
  const traceId = todoTraceId(repo, "pull_request", pr.number, 0);
  // When review/CI wasn't fetched (no token), say so instead of "checks none".
  const statusLine =
    !enriched && pr.checkState === "none"
      ? `+${pr.additions ?? 0} −${pr.deletions ?? 0} across ${pr.changedFiles ?? 0} files · review/CI status requires a GitHub token`
      : `+${pr.additions ?? 0} −${pr.deletions ?? 0} across ${pr.changedFiles ?? 0} files · checks ${pr.checkState} · review ${pr.reviewState.replace("_", " ")}`;
  const evidence: Evidence[] = [
    {
      sourceType: "pull_request",
      sourceTitle: `#${pr.number} ${pr.title}`,
      sourceUrl: pr.htmlUrl,
      snippet: snippet(pr.body) || "(no description provided)",
      timestamp: pr.updatedAt,
      kind: "body",
    },
    {
      sourceType: "pull_request",
      sourceTitle: "Review & check status",
      sourceUrl: pr.htmlUrl,
      snippet: statusLine,
      timestamp: pr.updatedAt,
      kind: "status",
    },
  ];
  if (pr.lastComment) {
    evidence.push({
      sourceType: "pull_request",
      sourceTitle: `Latest comment on #${pr.number}`,
      sourceUrl: pr.htmlUrl,
      snippet: snippet(pr.lastComment),
      timestamp: pr.updatedAt,
      kind: "comment",
    });
  }

  return {
    id: `pr-${pr.number}`,
    traceId,
    kind: "source",
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
    evidence: withEvidenceIds(traceId, evidence),
  };
}

// ── Action extraction (multiple todos per source) ─────────────────────────────
type ActionTag = "task" | "todo" | "fixme" | "action" | "note";
interface Action {
  text: string;
  line: number;
  tag: ActionTag;
  origin: "body" | "comment";
}

/** Parse markdown task-lists and TODO/FIXME/Action/Note lines into actions. */
function parseActions(src: RawIssue): Action[] {
  const found: Action[] = [];
  const scan = (text: string | undefined, origin: "body" | "comment") => {
    if (!text) return;
    text.split(/\r?\n/).forEach((raw, idx) => {
      const line = idx + 1;
      // unchecked markdown task: "- [ ] foo", "* [ ] foo", "1. [ ] foo"
      const task = raw.match(/^\s*(?:[-*+]|\d+\.)\s+\[\s\]\s+(.+\S)\s*$/);
      if (task) {
        found.push({ text: task[1], line, tag: "task", origin });
        return;
      }
      // checked tasks ("[x]") are done — skip them deliberately.
      if (/^\s*(?:[-*+]|\d+\.)\s+\[[xX]\]/.test(raw)) return;
      // tagged action lines, optionally bulleted: "TODO: foo", "- FIXME foo"
      const tag = raw.match(
        /^\s*(?:[-*+]\s+)?(TODO|FIXME|ACTION|NOTE)\b\s*[:\-–)]*\s*(.+\S)\s*$/i,
      );
      if (tag) {
        found.push({
          text: tag[2],
          line,
          tag: tag[1].toLowerCase() as ActionTag,
          origin,
        });
      }
    });
  };
  scan(src.body, "body");
  scan(src.lastComment, "comment");

  // dedupe by normalized text, cap.
  const seen = new Set<string>();
  const unique = found.filter((a) => {
    const k = a.text.toLowerCase().replace(/\s+/g, " ").slice(0, 80);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return unique.slice(0, MAX_ACTIONS);
}

const URGENT_RE = /\b(urgent|asap|critical|blocker|block(s|ing)?|security|crash|broken|regression|p0)\b/i;
const MINOR_RE = /\b(docs?|typo|nit|cleanup|rename|comment|polish|later|someday)\b/i;
const DECISION_RE = /\b(decide|decision|discuss|agree|choose|figure out|spec out)\b/i;

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function actionPriority(parent: TodoPriority, a: Action): TodoPriority {
  let idx = PRIORITY_RANK[parent];
  if (URGENT_RE.test(a.text)) idx -= a.text.match(/blocker|security|p0/i) ? 2 : 1;
  if (a.tag === "fixme") idx -= 1; // a FIXME is more pressing than a plain TODO
  if (MINOR_RE.test(a.text)) idx += 1;
  return PRIORITY_ORDER[clamp(idx, 0, 3)];
}

function actionStatus(parent: TodoItem, a: Action): TodoStatus {
  if (DECISION_RE.test(a.text)) return "needs_decision";
  if (parent.sourceType === "pull_request" && /\breview\b/i.test(a.text))
    return "needs_review";
  return "needs_implementation";
}

function actionConfidence(a: Action): number {
  const base =
    a.tag === "task" || a.tag === "fixme"
      ? 0.82
      : a.tag === "action"
        ? 0.78
        : a.tag === "todo"
          ? 0.74
          : 0.6;
  return clamp(Number((base - (a.origin === "comment" ? 0.05 : 0)).toFixed(2)), 0.4, 0.95);
}

function buildAction(
  repo: string,
  parent: TodoItem,
  src: RawIssue,
  a: Action,
  position: number,
): TodoItem {
  const traceId = todoTraceId(repo, parent.sourceType ?? "issue", src.number, position);
  const priority = actionPriority(parent.priority, a);
  const status = actionStatus(parent, a);
  const evidenceKind: EvidenceKind = a.origin === "comment" ? "comment" : a.tag === "task" ? "task" : "todo";
  const evidence: Evidence[] = withEvidenceIds(traceId, [
    {
      sourceType: parent.sourceType ?? "issue",
      sourceTitle: `#${src.number} — ${a.tag.toUpperCase()} (${a.origin}, line ${a.line})`,
      sourceUrl: src.htmlUrl,
      snippet: a.text,
      timestamp: src.updatedAt,
      kind: evidenceKind,
      line: a.line,
    },
  ]);
  return {
    id: `${parent.id}-a${position}`,
    traceId,
    kind: "action",
    parentTraceId: parent.traceId,
    title: cap(snippet(a.text, 96)),
    summary: `Actionable item ${a.origin === "comment" ? "from a comment on" : "in"} #${src.number}.`,
    priority,
    status,
    suggestedAction: cap(a.text),
    rationale: `Extracted from ${a.origin === "comment" ? "a comment" : "the description"} of #${src.number} (${a.tag} item, line ${a.line}). Inherits context: “${snippet(parent.title, 60)}”.`,
    confidence: actionConfidence(a),
    labels: parent.labels,
    assignees: parent.assignees,
    updatedAt: parent.updatedAt,
    sourceUrl: parent.sourceUrl,
    sourceType: parent.sourceType,
    reference: parent.reference,
    evidence,
  };
}

/** A source card plus any actions extracted from it (parent fallback if none). */
function extractFromSource(
  repo: string,
  src: RawIssue | RawPullRequest,
  isPR: boolean,
  viewer: string | undefined,
  enriched: boolean,
): TodoItem[] {
  const parent = isPR
    ? prToTodo(repo, src as RawPullRequest, viewer, enriched)
    : issueToTodo(repo, src, viewer);
  const actions = parseActions(src);
  parent.childCount = actions.length;
  if (!actions.length) return [parent];
  const children = actions.map((a, i) => buildAction(repo, parent, src, a, i + 1));
  return [parent, ...children];
}

export function extractTodos(bundle: IntakeBundle): TodoItem[] {
  const repo = bundle.repo.fullName;
  const enriched = bundle.meta ? bundle.meta.reviewCi : true;
  const todos = [
    ...bundle.issues.flatMap((i) => extractFromSource(repo, i, false, bundle.viewerLogin, enriched)),
    ...bundle.pullRequests.flatMap((p) => extractFromSource(repo, p, true, bundle.viewerLogin, enriched)),
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
    enrichment: bundle.meta,
  };
}

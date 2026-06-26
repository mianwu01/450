import type { RepoAnalysisResult, TodoItem } from "@/types/domain";
import { PRIORITY_ORDER, STATUS_META } from "./presentation";

export function toJSON(result: RepoAnalysisResult): string {
  return JSON.stringify(result, null, 2);
}

export function toMarkdown(result: RepoAnalysisResult): string {
  const lines: string[] = [];
  lines.push(`# Workflow triage — ${result.repoName}`);
  lines.push("");
  lines.push(`> ${result.description ?? ""}`);
  lines.push("");
  lines.push(
    `**Health:** ${result.healthStatus}  ·  **Open issues:** ${
      result.openIssues ?? 0
    }  ·  **Open PRs:** ${result.openPRs ?? 0}  ·  **Generated:** ${new Date(
      result.generatedAt,
    ).toLocaleString()}`,
  );
  lines.push("");
  lines.push(`Source: ${result.repoUrl}`);
  if (result.brief) {
    lines.push("");
    lines.push(`**Brief${result.engine ? ` (${result.engine})` : ""}:** ${result.brief}`);
  }
  lines.push("");

  for (const p of PRIORITY_ORDER) {
    const items = result.todos.filter((t) => t.priority === p);
    if (!items.length) continue;
    lines.push(`## ${p} — ${items.length} item${items.length > 1 ? "s" : ""}`);
    lines.push("");
    for (const t of items) lines.push(...todoBlock(t));
    lines.push("");
  }
  return lines.join("\n");
}

function todoBlock(t: TodoItem): string[] {
  const out: string[] = [];
  const ref = t.reference ? `#${t.reference} ` : "";
  const tag = t.kind === "action" ? " ↳" : "";
  out.push(`###${tag} ${ref}${t.title}`);
  out.push(
    `- **Priority:** ${t.priority}  ·  **Status:** ${
      STATUS_META[t.status].label
    }  ·  **Confidence:** ${t.confidence != null ? Math.round(t.confidence * 100) + "%" : "—"}`,
  );
  if (t.traceId) {
    out.push(
      `- **Trace ID:** \`${t.traceId}\`${
        t.parentTraceId ? `  ·  **Parent:** \`${t.parentTraceId}\`` : ""
      }`,
    );
  }
  out.push(`- **Source:** ${t.sourceType ?? "issue"} — ${t.sourceUrl ?? ""}`);
  out.push(`- **Summary:** ${t.summary}`);
  out.push(`- **Why it matters:** ${t.rationale}`);
  out.push(`- **Suggested action:** ${t.suggestedAction}`);
  if (t.evidence.length) {
    out.push(`- **Evidence:**`);
    for (const e of t.evidence) {
      const id = e.traceId ? ` \`[${e.traceId}]\`` : "";
      const where = e.line ? ` (line ${e.line})` : "";
      out.push(`  - _${e.sourceTitle}_${where}: "${e.snippet}"${id}`);
    }
  }
  out.push("");
  return out;
}

export function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

import type { RepoAnalysisResult } from "@/types/domain";
import { chatComplete } from "./modelClient";
import type { ChatMsg } from "./modelClient";

// Turns the deterministic analysis into a natural prose paragraph and asks the
// local model to continue it after an "In summary," stem — which a base model
// (GPT-2) completes far more coherently than an instruction or a bullet list.
export function buildBriefMessages(result: RepoAnalysisResult): ChatMsg[] {
  const titles = result.todos
    .slice(0, 3)
    .map((t) => t.title.replace(/[.;]$/, ""))
    .join("; ");
  const prompt =
    `Project ${result.repoName} has ${result.openIssues ?? 0} open issues and ` +
    `${result.openPRs ?? 0} open pull requests. Workflow health is ${result.healthStatus}. ` +
    `The top priorities are: ${titles}. In summary,`;
  return [{ role: "user", content: prompt }];
}

export async function generateBrief(
  result: RepoAnalysisResult,
  baseUrl: string,
  apiKey?: string,
): Promise<string> {
  const text = await chatComplete(baseUrl, buildBriefMessages(result), {
    maxTokens: 32,
    temperature: 0.55,
    apiKey,
  });
  let clean = text.replace(/\s+/g, " ").trim().replace(/^[,:;\-\s]+/, "");
  if (clean.length < 8) throw new Error("model returned too little");
  // Reattach the stem so it reads as a complete sentence.
  clean = `In summary, ${clean}`;
  if (!/[.!?]$/.test(clean)) clean += ".";
  return clean;
}

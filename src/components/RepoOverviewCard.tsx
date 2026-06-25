import {
  Star,
  GitFork,
  CircleDot,
  GitPullRequest,
  Code2,
  Clock,
  ExternalLink,
  Activity,
} from "lucide-react";
import type { RepoAnalysisResult } from "@/types/domain";
import { HEALTH_META } from "@/lib/presentation";
import { compactNumber, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

function Stat({
  icon: Icon,
  label,
  value,
  tone = "text-slate-200",
}: {
  icon: typeof Star;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
      <Icon className="h-4 w-4 text-slate-500" />
      <div className="leading-tight">
        <div className={cn("text-sm font-semibold tabular-nums", tone)}>{value}</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export function RepoOverviewCard({ result }: { result: RepoAnalysisResult }) {
  const health = HEALTH_META[result.healthStatus];
  return (
    <section className="glass relative overflow-hidden p-5 animate-fade-up">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-[#5b8cff] text-sm shadow-glow">
                🛰️
              </div>
              <div className="min-w-0">
                <a
                  href={result.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-1.5 text-lg font-bold text-gradient"
                >
                  {result.repoName}
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-accent" />
                </a>
                <p className="mt-0.5 line-clamp-1 max-w-xl text-[13px] text-slate-400">
                  {result.description ?? "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Health pill */}
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border border-line bg-ink-900/60 px-3.5 py-2 ring-1",
              health.ring,
            )}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-pulse-ring rounded-full",
                  health.dot,
                )}
              />
              <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", health.dot)} />
            </span>
            <Activity className={cn("h-3.5 w-3.5", health.text)} />
            <span className={cn("text-sm font-semibold", health.text)}>
              {health.label}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <Stat icon={Star} label="Stars" value={compactNumber(result.stars)} />
          <Stat icon={GitFork} label="Forks" value={compactNumber(result.forks)} />
          <Stat
            icon={CircleDot}
            label="Open issues"
            value={String(result.openIssues ?? 0)}
            tone="text-mint"
          />
          <Stat
            icon={GitPullRequest}
            label="Open PRs"
            value={String(result.openPRs ?? 0)}
            tone="text-p2"
          />
          <Stat icon={Code2} label="Language" value={result.language ?? "—"} />
          <Stat icon={Clock} label="Updated" value={timeAgo(result.lastUpdated)} />
        </div>
      </div>
    </section>
  );
}

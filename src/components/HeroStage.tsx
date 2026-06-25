import { Star, GitFork, CircleDot, GitPullRequest, ArrowUpRight } from "lucide-react";
import type { RepoAnalysisResult } from "@/types/domain";
import type { AdapterMode } from "@/adapters";
import { HEALTH_META } from "@/lib/presentation";
import { useSettings } from "@/lib/settings";
import { useParallax } from "@/hooks/useParallax";
import { compactNumber, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CinematicScene } from "./CinematicScene";
import { RepoInput } from "./RepoInput";
import { BrandButton, AssistantButton, MusicButton } from "./Controls";

type Phase = "welcome" | "loading" | "ready" | "error";

interface AudioCtl {
  playing: boolean;
  hasTrack: boolean;
  toggle: () => void;
}

export function HeroStage({
  phase,
  result,
  loadingLabel,
  input,
  onInput,
  onAnalyze,
  mode,
  onMode,
  onOpenSettings,
  onHome,
  audio,
}: {
  phase: Phase;
  result: RepoAnalysisResult | null;
  loadingLabel: string;
  input: string;
  onInput: (v: string) => void;
  onAnalyze: () => void;
  mode: AdapterMode;
  onMode: (m: AdapterMode) => void;
  onOpenSettings: () => void;
  onHome: () => void;
  audio: AudioCtl;
}) {
  const welcome = phase === "welcome";
  const s = useSettings();
  const parallaxRef = useParallax<HTMLDivElement>(
    s.motion.parallax && !s.motion.reduced,
    s.motion.intensity,
  );

  return (
    <div
      ref={parallaxRef}
      className={cn(
        "relative shrink-0 overflow-hidden transition-[height,border-radius,margin] [transition-duration:1100ms] ease-out-expo",
        welcome
          ? "h-[100svh] min-h-[560px] rounded-none m-0"
          : "m-3 h-[300px] rounded-[28px] shadow-lift md:m-4 md:h-[340px]",
      )}
    >
      <CinematicScene background={s.background} still={s.motion.reduced} />

      {welcome && (
        <div className="absolute inset-0 flex flex-col">
          <div className="flex items-center justify-between px-5 py-5 md:px-9">
            <BrandButton onClick={onHome} dark />
            <div className="flex items-center gap-2">
              <MusicButton
                playing={audio.playing}
                hasTrack={audio.hasTrack}
                onToggle={audio.toggle}
                onOpen={onOpenSettings}
                dark
              />
              <AssistantButton onOpen={onOpenSettings} dark />
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <h1 className="max-w-4xl text-[clamp(2.6rem,7vw,5.4rem)] font-semibold text-display text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.35)]">
              <span className="reveal-line">
                <span style={{ animationDelay: "0.05s" }}>Turn a repository</span>
              </span>
              <span className="reveal-line">
                <span style={{ animationDelay: "0.16s" }}>
                  into a{" "}
                  <span className="relative whitespace-nowrap">
                    <span className="relative z-10">work plan</span>
                    <span className="absolute -bottom-1 left-0 z-0 h-[0.42em] w-full -rotate-1 rounded-full bg-accent/90" />
                  </span>
                </span>
              </span>
            </h1>
            <p
              className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/80 animate-fade-in [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]"
              style={{ animationDelay: "0.5s" }}
            >
              Read issues, pull requests and activity from any GitHub repo, then get a
              source-grounded, prioritized todo list — with the evidence behind every call.
            </p>

            <div className="mt-9 w-full animate-fade-up" style={{ animationDelay: "0.6s" }}>
              <RepoInput
                value={input}
                onChange={onInput}
                onAnalyze={onAnalyze}
                loading={false}
                mode={mode}
                onModeChange={onMode}
                onDark
              />
            </div>
          </div>
        </div>
      )}

      {!welcome && (
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-7">
          {phase === "loading" && (
            <div className="animate-fade-in">
              <div className="label text-white/70">Analyzing</div>
              <div className="mt-1 flex items-center gap-3 text-2xl font-semibold text-display text-white">
                {loadingLabel}
                <span className="inline-flex gap-1">
                  <Dot /> <Dot d="0.15s" /> <Dot d="0.3s" />
                </span>
              </div>
            </div>
          )}
          {phase === "error" && (
            <div className="animate-fade-in">
              <div className="label text-white/70">Analysis</div>
              <div className="mt-1 text-2xl font-semibold text-display text-white">
                Couldn’t build the plan
              </div>
            </div>
          )}
          {phase === "ready" && result && <DockedOverview result={result} />}
        </div>
      )}
    </div>
  );
}

function DockedOverview({ result }: { result: RepoAnalysisResult }) {
  const health = HEALTH_META[result.healthStatus];
  return (
    <div className="animate-fade-up">
      <a
        href={result.repoUrl}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.16em] text-white/75 hover:text-white"
      >
        {result.repoName}
        <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition group-hover:opacity-100" />
      </a>
      <div className="mt-1.5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="max-w-2xl text-3xl font-semibold text-display text-white md:text-[2.6rem] [text-shadow:0_2px_24px_rgba(0,0,0,0.4)]">
          {result.description ? truncate(result.description, 64) : result.repoName.split("/").pop()}
        </h2>
        <span
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold text-ink shadow-pop"
          style={{ backgroundColor: health.hex }}
        >
          <span className="h-2 w-2 rounded-full bg-ink/80" />
          {health.label}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Chip icon={Star} value={compactNumber(result.stars)} label="stars" />
        <Chip icon={GitFork} value={compactNumber(result.forks)} label="forks" />
        <Chip icon={CircleDot} value={String(result.openIssues ?? 0)} label="issues" />
        <Chip icon={GitPullRequest} value={String(result.openPRs ?? 0)} label="PRs" />
        <span className="pill-dark">{result.language ?? "—"}</span>
        <span className="pill-dark">updated {timeAgo(result.lastUpdated)}</span>
      </div>
    </div>
  );
}

function Chip({ icon: Icon, value, label }: { icon: typeof Star; value: string; label: string }) {
  return (
    <span className="pill-dark">
      <Icon className="h-3.5 w-3.5 opacity-80" />
      <span className="num font-semibold text-white">{value}</span>
      <span className="text-white/55">{label}</span>
    </span>
  );
}

function Dot({ d = "0s" }: { d?: string }) {
  return <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" style={{ animationDelay: d }} />;
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

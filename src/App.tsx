import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, Rows3, ListChecks, Clock3 } from "lucide-react";
import type { RepoAnalysisResult, TodoPriority } from "@/types/domain";
import { runAnalysis, AnalysisError, ANALYSIS_STEPS } from "@/adapters";
import type { AdapterMode, StepId, StepStatus, AnalysisErrorKind } from "@/adapters";
import {
  applyFilters,
  byPriority,
  blockedOrDecisions,
  emptyFilters,
  reviewQueue,
  staleItems,
  todaysFocus,
  uniqueAssignees,
  uniqueLabels,
} from "@/logic/selectors";
import type { Filters } from "@/logic/selectors";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/settings";
import { useAudio } from "@/hooks/useAudio";

import { Sidebar } from "@/components/Sidebar";
import type { RepoTab } from "@/components/Sidebar";
import { HeroStage } from "@/components/HeroStage";
import { RepoInput } from "@/components/RepoInput";
import { TodaysFocus } from "@/components/TodaysFocus";
import { PriorityBoard } from "@/components/PriorityColumn";
import { BlockedSection, ReviewQueue, StaleItems } from "@/components/DashboardSections";
import { DashboardFilters } from "@/components/DashboardFilters";
import { AnalysisLoadingState } from "@/components/AnalysisLoadingState";
import { ErrorState, WelcomeFeatures } from "@/components/EmptyStates";
import { ExportMenu } from "@/components/ExportMenu";
import { TokenSettings } from "@/components/TokenSettings";
import { SettingsPanel } from "@/components/SettingsPanel";
import { MusicButton, AssistantButton, EngineChip, VibeSwitcher } from "@/components/Controls";
import { Section, EmptyHint } from "@/components/Section";
import { TodoCard } from "@/components/TodoCard";

type Phase = "welcome" | "loading" | "ready" | "error";
type View = "board" | "streams";

const initialSteps = (): Record<StepId, StepStatus> =>
  Object.fromEntries(ANALYSIS_STEPS.map((s) => [s.id, "pending"])) as Record<StepId, StepStatus>;

export default function App() {
  const [mode, setMode] = useState<AdapterMode>("mock");
  const [input, setInput] = useState("hkuds/academic-workflow-agent");
  const [phase, setPhase] = useState<Phase>("welcome");
  const [steps, setSteps] = useState<Record<StepId, StepStatus>>(initialSteps);
  const [result, setResult] = useState<RepoAnalysisResult | null>(null);
  const [error, setError] = useState<
    { kind: AnalysisErrorKind; message: string; detail?: string } | null
  >(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters());
  const [view, setView] = useState<View>("streams");
  const [history, setHistory] = useState<Record<string, RepoAnalysisResult>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const settings = useSettings();
  const audio = useAudio(settings.music);

  const abortRef = useRef<AbortController | null>(null);
  const [loadingLabel, setLoadingLabel] = useState(input);

  function goHome() {
    setPhase("welcome");
    setInput("");
  }

  async function analyze(raw?: string) {
    const target = raw ?? input;
    setLoadingLabel(target);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setPhase("loading");
    setError(null);
    setSteps(initialSteps());
    setFilters(emptyFilters());

    try {
      const res = await runAnalysis(target, {
        mode,
        signal: ctrl.signal,
        onStep: (id, status) => setSteps((prev) => ({ ...prev, [id]: status })),
      });
      if (ctrl.signal.aborted) return;
      setResult(res);
      setHistory((h) => ({ ...h, [res.repoName]: res }));
      setPhase("ready");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      const err =
        e instanceof AnalysisError
          ? { kind: e.kind, message: e.message, detail: e.detail }
          : { kind: "unknown" as AnalysisErrorKind, message: "Analysis failed.", detail: String(e) };
      setError(err);
      setPhase("error");
    }
  }

  const filtered = useMemo(
    () => (result ? applyFilters(result.todos, filters) : []),
    [result, filters],
  );
  const groups = useMemo(() => byPriority(filtered), [filtered]);
  const counts = useMemo(
    () => (result ? byPriorityCounts(result.todos) : { P0: 0, P1: 0, P2: 0, P3: 0 }),
    [result],
  );
  const repoTabs: RepoTab[] = useMemo(
    () => Object.values(history).map((r) => ({ name: r.repoName, health: r.healthStatus })),
    [history],
  );
  const priorityFilter: TodoPriority | null =
    filters.priorities.size === 1 ? [...filters.priorities][0] : null;

  useEffect(() => {
    if (!expandedId) return;
    setView("streams");
    const el = document.getElementById(`todo-${expandedId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [expandedId]);

  const welcome = phase === "welcome";

  return (
    <div className="flex h-screen overflow-hidden">
      {!welcome && (
        <Sidebar
          repos={repoTabs}
          activeRepo={result?.repoName ?? null}
          onSelectRepo={(name) => {
            const r = history[name];
            if (r) {
              setResult(r);
              setPhase("ready");
              setFilters(emptyFilters());
            }
          }}
          onNewRepo={goHome}
          onHome={goHome}
          counts={counts}
          total={result?.todos.length ?? 0}
          priorityFilter={priorityFilter}
          onPriorityFilter={(p) =>
            setFilters((f) => ({ ...f, priorities: p ? new Set([p]) : new Set() }))
          }
          mode={mode}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        {!welcome && (
          <header className="flex animate-fade-in items-center gap-3 border-b border-line bg-paper-warm/80 px-4 py-2.5 backdrop-blur-xl">
            <RepoInput
              value={input}
              onChange={setInput}
              onAnalyze={() => analyze()}
              loading={phase === "loading"}
              mode={mode}
              onModeChange={setMode}
              compact
            />
            <div className="ml-auto flex items-center gap-2">
              {phase === "ready" && result && (
                <>
                  <EngineChip model={settings.model} onOpen={() => setSettingsOpen(true)} />
                  <ExportMenu result={result} />
                </>
              )}
              <VibeSwitcher />
              <MusicButton
                playing={audio.playing}
                hasTrack={audio.hasTrack}
                onToggle={audio.toggle}
                onOpen={() => setSettingsOpen(true)}
              />
              <AssistantButton onOpen={() => setSettingsOpen(true)} compact />
              <TokenSettings />
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto">
          <HeroStage
            phase={phase}
            result={result}
            loadingLabel={loadingLabel}
            input={input}
            onInput={setInput}
            onAnalyze={() => analyze()}
            mode={mode}
            onMode={setMode}
            onOpenSettings={() => setSettingsOpen(true)}
            onHome={goHome}
            audio={{ playing: audio.playing, hasTrack: audio.hasTrack, toggle: audio.toggle }}
          />

          <div className="mx-auto max-w-6xl px-4 pb-10 md:px-6">
            {welcome && (
              <div className="py-6">
                <WelcomeFeatures />
              </div>
            )}

            {phase === "loading" && (
              <div className="mx-auto max-w-xl pt-5">
                <AnalysisLoadingState steps={steps} />
              </div>
            )}

            {phase === "error" && error && (
              <ErrorState
                kind={error.kind}
                message={error.message}
                detail={error.detail}
                onRetry={() => analyze()}
              />
            )}

            {phase === "ready" && result && (
              <div className="space-y-5 pt-5">
                <TodaysFocus items={todaysFocus(result.todos)} onOpen={setExpandedId} />

                <div className="flex flex-wrap items-center gap-3">
                  <DashboardFilters
                    filters={filters}
                    onChange={setFilters}
                    assignees={uniqueAssignees(result)}
                    labels={uniqueLabels(result)}
                  />
                  <ViewToggle view={view} onChange={setView} />
                </div>

                {filtered.length === 0 ? (
                  <Section icon={ListChecks} title="No matching todos">
                    <EmptyHint>No todos match the current filters. Try clearing them.</EmptyHint>
                  </Section>
                ) : view === "board" ? (
                  <Section
                    icon={LayoutGrid}
                    title="Priority Board"
                    subtitle="Every extracted todo, bucketed P0 → P3"
                    count={filtered.length}
                  >
                    <PriorityBoard groups={groups} />
                  </Section>
                ) : (
                  <div className="space-y-5">
                    <BlockedSection items={blockedOrDecisions(filtered)} />
                    <div className="grid gap-5 lg:grid-cols-2">
                      <ReviewQueue items={reviewQueue(filtered)} />
                      <StaleItems items={staleItems(filtered)} />
                    </div>
                    <AllTodos items={filtered} expandedId={expandedId} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function byPriorityCounts(todos: RepoAnalysisResult["todos"]) {
  const g = byPriority(todos);
  return { P0: g.P0.length, P1: g.P1.length, P2: g.P2.length, P3: g.P3.length };
}

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="ml-auto flex items-center rounded-full bg-surface p-0.5 shadow-hair">
      {(
        [
          { v: "streams", icon: Rows3, label: "Streams" },
          { v: "board", icon: LayoutGrid, label: "Board" },
        ] as const
      ).map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
            view === o.v ? "bg-ink text-paper" : "text-ink-3 hover:text-ink",
          )}
        >
          <o.icon className="h-3.5 w-3.5" />
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AllTodos({
  items,
  expandedId,
}: {
  items: RepoAnalysisResult["todos"];
  expandedId: string | null;
}) {
  return (
    <Section
      icon={Clock3}
      title="All Extracted Todos"
      subtitle="Source-grounded, ranked, and traceable"
      count={items.length}
    >
      <div className="space-y-2.5">
        {items.map((t, i) => (
          <div key={t.id} id={`todo-${t.id}`}>
            <TodoCard todo={t} index={i} defaultOpen={t.id === expandedId} />
          </div>
        ))}
      </div>
    </Section>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, Rows3, ListChecks, Clock3 } from "lucide-react";
import type { RepoAnalysisResult, TodoPriority } from "@/types/domain";
import {
  runAnalysis,
  AnalysisError,
  ANALYSIS_STEPS,
} from "@/adapters";
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
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import { Sidebar } from "@/components/Sidebar";
import type { RepoTab } from "@/components/Sidebar";
import { RepoInput } from "@/components/RepoInput";
import { RepoOverviewCard } from "@/components/RepoOverviewCard";
import { TodaysFocus } from "@/components/TodaysFocus";
import { PriorityBoard } from "@/components/PriorityColumn";
import {
  BlockedSection,
  ReviewQueue,
  StaleItems,
} from "@/components/DashboardSections";
import { DashboardFilters } from "@/components/DashboardFilters";
import { AnalysisLoadingState } from "@/components/AnalysisLoadingState";
import { ErrorState, WelcomeHero } from "@/components/EmptyStates";
import { ExportMenu } from "@/components/ExportMenu";
import { TokenSettings } from "@/components/TokenSettings";
import { Section, EmptyHint } from "@/components/Section";
import { TodoCard } from "@/components/TodoCard";

type Phase = "welcome" | "loading" | "ready" | "error";
type View = "board" | "streams";

const initialSteps = (): Record<StepId, StepStatus> =>
  Object.fromEntries(ANALYSIS_STEPS.map((s) => [s.id, "pending"])) as Record<
    StepId,
    StepStatus
  >;

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

  const abortRef = useRef<AbortController | null>(null);
  const loadingLabel = useRef(input);

  async function analyze(raw?: string) {
    const target = raw ?? input;
    loadingLabel.current = target;
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
        onStep: (id, status) =>
          setSteps((prev) => ({ ...prev, [id]: status })),
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
          : {
              kind: "unknown" as AnalysisErrorKind,
              message: "Analysis failed.",
              detail: String(e),
            };
      setError(err);
      setPhase("error");
    }
  }

  // Derived views
  const filtered = useMemo(
    () => (result ? applyFilters(result.todos, filters) : []),
    [result, filters],
  );
  const groups = useMemo(() => byPriority(filtered), [filtered]);
  const counts = useMemo(
    () =>
      result
        ? byPriorityCounts(result.todos)
        : { P0: 0, P1: 0, P2: 0, P3: 0 },
    [result],
  );

  const repoTabs: RepoTab[] = useMemo(
    () =>
      Object.values(history).map((r) => ({
        name: r.repoName,
        health: r.healthStatus,
      })),
    [history],
  );

  const priorityFilter: TodoPriority | null =
    filters.priorities.size === 1 ? [...filters.priorities][0] : null;

  // Scroll-to + expand when opening from Today's Focus
  useEffect(() => {
    if (!expandedId) return;
    setView("streams");
    const el = document.getElementById(`todo-${expandedId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [expandedId]);

  return (
    <div className="flex h-screen overflow-hidden bg-grid-faint bg-[size:32px_32px]">
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
        onNewRepo={() => {
          setPhase("welcome");
          setInput("");
        }}
        counts={counts}
        total={result?.todos.length ?? 0}
        priorityFilter={priorityFilter}
        onPriorityFilter={(p) =>
          setFilters((f) => ({
            ...f,
            priorities: p ? new Set([p]) : new Set(),
          }))
        }
        mode={mode}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center gap-3 border-b border-line bg-ink-900/40 px-5 py-3 backdrop-blur-xl">
          <RepoInput
            value={input}
            onChange={setInput}
            onAnalyze={() => analyze()}
            loading={phase === "loading"}
            mode={mode}
            onModeChange={setMode}
            compact
          />
          <div className="ml-auto flex items-center gap-3">
            {phase === "ready" && result && (
              <>
                <span className="hidden text-[11px] text-slate-500 lg:block">
                  Generated {formatDateTime(result.generatedAt)}
                </span>
                <ExportMenu result={result} />
              </>
            )}
            <TokenSettings />
          </div>
        </header>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="mx-auto max-w-6xl space-y-5">
            {phase === "welcome" && (
              <Welcome
                input={input}
                setInput={setInput}
                analyze={analyze}
                mode={mode}
                setMode={setMode}
              />
            )}

            {phase === "loading" && (
              <AnalysisLoadingState steps={steps} repoLabel={loadingLabel.current} />
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
              <>
                <RepoOverviewCard result={result} />
                <TodaysFocus
                  items={todaysFocus(result.todos)}
                  onOpen={(id) => setExpandedId(id)}
                />

                {/* Toolbar */}
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
                    <EmptyHint>
                      No todos match the current filters. Try clearing them.
                    </EmptyHint>
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function byPriorityCounts(todos: RepoAnalysisResult["todos"]) {
  const g = byPriority(todos);
  return {
    P0: g.P0.length,
    P1: g.P1.length,
    P2: g.P2.length,
    P3: g.P3.length,
  };
}

function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <div className="ml-auto flex items-center rounded-xl border border-line bg-ink-800/60 p-0.5">
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
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
            view === o.v
              ? "bg-white/10 text-slate-100"
              : "text-slate-500 hover:text-slate-300",
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

function Welcome({
  input,
  setInput,
  analyze,
  mode,
  setMode,
}: {
  input: string;
  setInput: (v: string) => void;
  analyze: (raw?: string) => void;
  mode: AdapterMode;
  setMode: (m: AdapterMode) => void;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center py-12 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[11px] text-slate-400 animate-fade-in">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
        Academic Workflow Assistant · GitHub slice
      </div>
      <h1 className="text-balance text-4xl font-extrabold tracking-tight text-gradient animate-fade-up">
        Turn a repository into a prioritized work plan
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-400 animate-fade-up">
        Point the assistant at a GitHub repo. It reads issues, pull requests, and
        activity, then extracts source-grounded todos — ranked P0–P3 with evidence
        you can trace back to the source.
      </p>

      <div className="mt-7 flex w-full flex-col items-center animate-fade-up">
        <RepoInput
          value={input}
          onChange={setInput}
          onAnalyze={() => analyze()}
          loading={false}
          mode={mode}
          onModeChange={setMode}
        />
      </div>

      <div className="mt-8 w-full">
        <WelcomeHero />
      </div>
    </div>
  );
}

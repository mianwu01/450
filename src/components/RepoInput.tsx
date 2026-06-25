import { useState } from "react";
import { Search, Sparkles, Loader2, Github, Wifi, WifiOff } from "lucide-react";
import type { AdapterMode } from "@/adapters";
import { cn } from "@/lib/utils";

const EXAMPLES = ["hkuds/academic-workflow-agent", "facebook/react", "vercel/next.js"];

export function RepoInput({
  value,
  onChange,
  onAnalyze,
  loading,
  mode,
  onModeChange,
  compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onAnalyze: () => void;
  loading: boolean;
  mode: AdapterMode;
  onModeChange: (m: AdapterMode) => void;
  compact?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn("w-full", compact ? "max-w-xl" : "max-w-2xl")}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border bg-ink-800/70 p-1.5 backdrop-blur-xl transition-all",
          focused ? "border-accent/50 shadow-glow" : "border-line",
        )}
      >
        <div className="flex items-center pl-2.5 text-slate-500">
          <Github className="h-4 w-4" />
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === "Enter" && !loading && onAnalyze()}
          placeholder="owner/repo or https://github.com/owner/repo"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-100 placeholder:text-slate-600 focus:outline-none"
        />

        {/* Data-source toggle */}
        <div className="flex items-center rounded-xl border border-line bg-ink-900/60 p-0.5 text-[11px]">
          <button
            onClick={() => onModeChange("mock")}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-colors",
              mode === "mock"
                ? "bg-white/10 text-slate-100"
                : "text-slate-500 hover:text-slate-300",
            )}
            title="Curated offline dataset"
          >
            <WifiOff className="h-3 w-3" /> Sample
          </button>
          <button
            onClick={() => onModeChange("live")}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-colors",
              mode === "live"
                ? "bg-white/10 text-mint"
                : "text-slate-500 hover:text-slate-300",
            )}
            title="Read-only public GitHub API"
          >
            <Wifi className="h-3 w-3" /> Live
          </button>
        </div>

        <button
          onClick={onAnalyze}
          disabled={loading || !value.trim()}
          className="btn btn-primary px-4"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? "Analyzing" : "Analyze"}
        </button>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <Search className="h-3 w-3" /> Try
          </span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => onChange(ex)}
              className="chip transition-colors hover:border-accent/40 hover:text-accent"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

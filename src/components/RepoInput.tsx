import { useState } from "react";
import { ArrowRight, Loader2, WifiOff, Wifi } from "lucide-react";
import type { AdapterMode } from "@/adapters";
import { cn } from "@/lib/utils";

const EXAMPLES = ["hkuds/academic-workflow-agent", "vercel/swr", "facebook/react"];

export function RepoInput({
  value,
  onChange,
  onAnalyze,
  loading,
  mode,
  onModeChange,
  compact = false,
  onDark = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onAnalyze: () => void;
  loading: boolean;
  mode: AdapterMode;
  onModeChange: (m: AdapterMode) => void;
  compact?: boolean;
  onDark?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn("mx-auto w-full", compact ? "max-w-xl" : "max-w-xl")}>
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full bg-surface p-1.5 transition-all duration-200",
          focused ? "shadow-lift ring-2 ring-accent/50" : "shadow-card",
        )}
      >
        <span className="pl-3 font-mono text-[13px] text-ink-3 select-none">
          github.com/
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === "Enter" && !loading && onAnalyze()}
          placeholder="owner/repo"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent py-1.5 font-mono text-[14px] text-ink placeholder:text-ink-4 focus:outline-none"
        />

        <div className="flex items-center rounded-full bg-surface-3 p-0.5">
          <ModeBtn
            active={mode === "mock"}
            onClick={() => onModeChange("mock")}
            icon={WifiOff}
            label="Sample"
          />
          <ModeBtn
            active={mode === "live"}
            onClick={() => onModeChange("live")}
            icon={Wifi}
            label="Live"
            activeClass="bg-mint text-white"
          />
        </div>

        <button
          onClick={onAnalyze}
          disabled={loading || !value.trim()}
          className="btn btn-ink shrink-0 px-4"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Analyze <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {!compact && (
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => onChange(ex)}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors",
                onDark
                  ? "bg-white/10 text-white/80 hover:bg-white/20"
                  : "bg-surface text-ink-2 shadow-hair hover:shadow-card",
              )}
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  icon: Icon,
  label,
  activeClass = "bg-ink text-paper",
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Wifi;
  label: string;
  activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors",
        active ? activeClass : "text-ink-3 hover:text-ink",
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}

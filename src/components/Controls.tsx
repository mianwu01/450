import { useRef } from "react";
import { Volume2, VolumeX, SlidersHorizontal, ChevronDown, Cpu } from "lucide-react";
import { modelLabel } from "@/lib/settings";
import { cn } from "@/lib/utils";

export function Mark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg",
        tone === "dark" ? "bg-white/10 ring-1 ring-white/20" : "bg-ink",
      )}
    >
      <span className="relative block h-4 w-4">
        <span className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-accent" />
        <span
          className={cn(
            "absolute bottom-[3px] left-0 h-[2px] w-full rounded",
            tone === "dark" ? "bg-white" : "bg-paper",
          )}
        />
      </span>
    </span>
  );
}

/** Brand = home. Returns to the landing to start a new analysis. */
export function BrandButton({ onClick, dark }: { onClick: () => void; dark?: boolean }) {
  return (
    <button
      onClick={onClick}
      title="Home — start a new analysis"
      className={cn(
        "group flex items-center gap-2.5 rounded-full pr-3 transition-colors",
        dark ? "hover:bg-white/10" : "hover:bg-surface-3",
      )}
    >
      <Mark tone={dark ? "dark" : "light"} />
      <span
        className={cn(
          "font-mono text-[12px] uppercase tracking-[0.2em]",
          dark ? "text-white/85" : "text-ink",
        )}
      >
        Workflow
      </span>
    </button>
  );
}

/**
 * "Academic Workflow Assistant" — opens the settings drawer. Per the brief it
 * opens on hover (with a small intent delay) as well as on click.
 */
export function AssistantButton({
  onOpen,
  dark,
  compact = false,
}: {
  onOpen: () => void;
  dark?: boolean;
  compact?: boolean;
}) {
  const timer = useRef<number | null>(null);

  const armHover = () => {
    timer.current = window.setTimeout(onOpen, 180);
  };
  const cancelHover = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <button
      onClick={() => {
        cancelHover();
        onOpen();
      }}
      onMouseEnter={armHover}
      onMouseLeave={cancelHover}
      className={dark ? "glass-ctl" : "btn"}
      title="Assistant settings — model, API, scene, music"
    >
      <SlidersHorizontal className="h-4 w-4" />
      {!compact && <span>Academic Workflow Assistant</span>}
      {compact && <span className="hidden sm:inline">Assistant</span>}
      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
    </button>
  );
}

export function MusicButton({
  playing,
  hasTrack,
  onToggle,
  onOpen,
  dark,
}: {
  playing: boolean;
  hasTrack: boolean;
  onToggle: () => void;
  onOpen: () => void;
  dark?: boolean;
}) {
  return (
    <button
      onClick={hasTrack ? onToggle : onOpen}
      className={cn(dark ? "glass-ctl" : "btn", "px-2.5")}
      title={hasTrack ? (playing ? "Mute music" : "Play music") : "Add a music track in settings"}
    >
      {playing ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}

/** Shows the active ranking engine; click opens settings to change it. */
export function EngineChip({ model, onOpen }: { model: string; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="hidden items-center gap-1.5 rounded-full bg-surface-3 px-2.5 py-1.5 text-[11px] text-ink-2 transition-colors hover:text-ink xl:inline-flex"
      title="Ranking engine — click to change"
    >
      <Cpu className="h-3.5 w-3.5" />
      <span className="label !text-ink-3">Ranked</span>
      <span className="font-medium">{modelLabel(model).replace(" (default)", "")}</span>
    </button>
  );
}

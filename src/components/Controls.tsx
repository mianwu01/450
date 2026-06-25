import { useEffect, useRef, useState } from "react";
import {
  Volume2,
  VolumeX,
  SlidersHorizontal,
  ChevronDown,
  Cpu,
  Check,
} from "lucide-react";
import { modelLabel, useSettings, updateSettings } from "@/lib/settings";
import { VIBES, getVibe, vibeThumb } from "@/data/scenes";
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

/**
 * Inline scene-vibe switcher — change the landscape (snowy peaks, aurora,
 * desert, ocean…) at any time, live. Only shown when the background is in
 * curated/vibes mode (custom image/video override it).
 */
export function VibeSwitcher({ dark }: { dark?: boolean }) {
  const s = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (s.background.kind !== "auto") return null;
  const active = getVibe(s.background.vibe);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(dark ? "glass-ctl" : "btn", "px-3")}
        title="Change scene vibe"
      >
        <span className="text-[15px] leading-none">{active.emoji}</span>
        <span className="hidden md:inline">{active.label}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-1.5 w-60 rounded-2xl bg-surface p-2 shadow-lift animate-fade-in">
          <div className="label px-1.5 pb-1.5 pt-1">Scene vibe</div>
          <div className="grid grid-cols-2 gap-1.5">
            {VIBES.map((v) => {
              const on = v.id === s.background.vibe;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    updateSettings({ background: { ...s.background, vibe: v.id } });
                    setOpen(false);
                  }}
                  className={cn(
                    "group relative overflow-hidden rounded-xl ring-2 transition-all",
                    on ? "ring-ink" : "ring-transparent hover:ring-line",
                  )}
                  title={v.label}
                >
                  <img src={vibeThumb(v)} alt={v.label} loading="lazy" className="h-12 w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-3 text-left text-[10px] font-medium text-white">
                    <span>{v.emoji}</span>
                    <span className="truncate">{v.label}</span>
                  </span>
                  {on && (
                    <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-ink">
                      <Check className="h-2.5 w-2.5 text-paper" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
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

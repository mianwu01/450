import { useSyncExternalStore } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// App settings — persisted to localStorage, shared via a tiny external store so
// any component can read/update with useSettings(). Covers the assistant model /
// API config (reserved for the future model adapter), the cinematic background
// source, motion, and background music.
// ─────────────────────────────────────────────────────────────────────────────

export type BackgroundKind = "auto" | "image" | "video" | "minimal";

export interface AppSettings {
  /** Ranking engine. "deterministic" runs the built-in ranker; model ids are
   *  reserved wiring for the future LLM adapter. */
  model: string;
  apiBaseUrl: string;
  apiKey: string;
  background: { kind: BackgroundKind; url: string; vibe: string; useVideo: boolean };
  /** Scene time-of-day mood, toggled from the Workflow mark. */
  mood: "day" | "night";
  motion: { parallax: boolean; intensity: number; reduced: boolean };
  music: { enabled: boolean; url: string; volume: number };
}

export const MODELS: { id: string; label: string }[] = [
  { id: "deterministic", label: "Deterministic ranker (default)" },
  { id: "claude-opus-4-8", label: "Claude Opus 4.8" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
  { id: "custom", label: "Custom endpoint…" },
];

export function modelLabel(id: string): string {
  return MODELS.find((m) => m.id === id)?.label ?? id;
}

const DEFAULTS: AppSettings = {
  model: "deterministic",
  apiBaseUrl: "https://api.anthropic.com",
  apiKey: "",
  background: { kind: "auto", url: "", vibe: "forest", useVideo: true },
  mood: "day",
  motion: { parallax: true, intensity: 1, reduced: false },
  music: { enabled: false, url: "", volume: 0.4 },
};

const KEY = "awa.settings";

function load(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      return {
        ...DEFAULTS,
        ...parsed,
        background: { ...DEFAULTS.background, ...parsed.background },
        motion: { ...DEFAULTS.motion, ...parsed.motion },
        music: { ...DEFAULTS.music, ...parsed.music },
      };
    }
  } catch {
    /* ignore */
  }
  return DEFAULTS;
}

let current: AppSettings = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function getSettings(): AppSettings {
  return current;
}

export function updateSettings(patch: Partial<AppSettings>): void {
  current = {
    ...current,
    ...patch,
    background: { ...current.background, ...patch.background },
    motion: { ...current.motion, ...patch.motion },
    music: { ...current.music, ...patch.music },
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* ignore persistence failure */
  }
  emit();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Reactive hook — re-renders on any settings change. */
export function useSettings(): AppSettings {
  return useSyncExternalStore(subscribe, getSettings, getSettings);
}

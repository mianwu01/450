import { useEffect } from "react";
import {
  X,
  Cpu,
  Image as ImageIcon,
  Music,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import { useSettings, updateSettings, MODELS } from "@/lib/settings";
import { VIBES, vibeThumb } from "@/data/scenes";
import { cn } from "@/lib/utils";

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useSettings();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-[380px] max-w-[92vw] flex-col bg-paper shadow-lift animate-slide-in-right">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink">
              <Sparkles className="h-4 w-4 text-accent" />
            </span>
            <div>
              <div className="text-[14px] font-semibold tracking-tight text-ink">
                Assistant settings
              </div>
              <div className="label">Academic Workflow Assistant</div>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface-3">
            <X className="h-4 w-4 text-ink-2" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {/* ── Assistant / model ── */}
          <Group icon={Cpu} title="Model & API" note="Reserved — ranking runs on the deterministic engine this milestone; these wire the future model adapter.">
            <Field label="Ranking model">
              <select
                value={s.model}
                onChange={(e) => updateSettings({ model: e.target.value })}
                className="ctl-select"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="API base URL">
              <input
                value={s.apiBaseUrl}
                onChange={(e) => updateSettings({ apiBaseUrl: e.target.value })}
                placeholder="https://api.anthropic.com"
                spellCheck={false}
                className="ctl-input font-mono"
              />
            </Field>
            <Field label="API key">
              <input
                type="password"
                value={s.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                placeholder="sk-…"
                autoComplete="off"
                spellCheck={false}
                className="ctl-input font-mono"
              />
            </Field>
          </Group>

          {/* ── Scene ── */}
          <Group icon={ImageIcon} title="Cinematic scene">
            <Field label="Background">
              <Segmented
                value={s.background.kind}
                onChange={(k) => updateSettings({ background: { ...s.background, kind: k } })}
                options={[
                  { value: "auto", label: "Vibes" },
                  { value: "image", label: "Image" },
                  { value: "video", label: "Video" },
                  { value: "minimal", label: "Minimal" },
                ]}
              />
            </Field>
            {s.background.kind === "auto" && (
              <Field label="Scene vibe">
                <div className="grid grid-cols-3 gap-2">
                  {VIBES.map((v) => {
                    const on = s.background.vibe === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => updateSettings({ background: { ...s.background, vibe: v.id } })}
                        className={cn(
                          "group relative overflow-hidden rounded-xl ring-2 transition-all",
                          on ? "ring-ink" : "ring-transparent hover:ring-line",
                        )}
                        title={v.label}
                      >
                        <img
                          src={vibeThumb(v)}
                          alt={v.label}
                          loading="lazy"
                          className="h-14 w-full object-cover"
                        />
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
              </Field>
            )}
            {(s.background.kind === "image" || s.background.kind === "video") && (
              <Field label={s.background.kind === "video" ? "Video URL (mp4/webm)" : "Image URL"}>
                <input
                  value={s.background.url}
                  onChange={(e) => updateSettings({ background: { ...s.background, url: e.target.value } })}
                  placeholder={s.background.kind === "video" ? "https://…/scene.mp4" : "https://…/photo.jpg"}
                  spellCheck={false}
                  className="ctl-input font-mono"
                />
              </Field>
            )}
            {s.background.kind === "auto" && (
              <Toggle
                label="Play motion video (when available)"
                checked={s.background.useVideo}
                onChange={(v) => updateSettings({ background: { ...s.background, useVideo: v } })}
              />
            )}
            <Field label="Time of day">
              <Segmented
                value={s.mood}
                onChange={(m) => updateSettings({ mood: m })}
                options={[
                  { value: "day", label: "☀︎ Day" },
                  { value: "night", label: "☾ Night" },
                ]}
              />
            </Field>
            <Toggle
              label="Pointer parallax"
              checked={s.motion.parallax}
              onChange={(v) => updateSettings({ motion: { ...s.motion, parallax: v } })}
            />
            <Field label={`Parallax intensity · ${s.motion.intensity.toFixed(1)}×`}>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={s.motion.intensity}
                onChange={(e) => updateSettings({ motion: { ...s.motion, intensity: Number(e.target.value) } })}
                className="w-full accent-ink"
              />
            </Field>
            <Toggle
              label="Reduce motion (calm scene)"
              checked={s.motion.reduced}
              onChange={(v) => updateSettings({ motion: { ...s.motion, reduced: v } })}
            />
          </Group>

          {/* ── Audio ── */}
          <Group icon={Music} title="Background music" note="Reserved. Provide a looping track URL; it starts after your first interaction (browsers block silent autoplay).">
            <Toggle
              label="Enable background music"
              checked={s.music.enabled}
              onChange={(v) => updateSettings({ music: { ...s.music, enabled: v } })}
            />
            <Field label="Track URL (mp3/ogg)">
              <input
                value={s.music.url}
                onChange={(e) => updateSettings({ music: { ...s.music, url: e.target.value } })}
                placeholder="https://…/ambient.mp3"
                spellCheck={false}
                className="ctl-input font-mono"
              />
            </Field>
            <Field label={`Volume · ${Math.round(s.music.volume * 100)}%`}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={s.music.volume}
                onChange={(e) => updateSettings({ music: { ...s.music, volume: Number(e.target.value) } })}
                className="w-full accent-ink"
              />
            </Field>
          </Group>

          <div className="flex items-start gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-[11px] text-ink-3">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Settings persist in this browser only. The GitHub read token lives under the
            separate <span className="font-medium text-ink-2">Token</span> control.
          </div>
        </div>
      </aside>
    </div>
  );
}

function Group({
  icon: Icon,
  title,
  note,
  children,
}: {
  icon: typeof Cpu;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2">
        <Icon className="h-4 w-4 text-ink-2" />
        <h3 className="text-[13px] font-semibold tracking-tight text-ink">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
      {note && <p className="mt-2 text-[11px] leading-relaxed text-ink-3">{note}</p>}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex items-center rounded-full bg-surface-3 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-full px-2 py-1.5 text-[12px] font-medium transition-colors",
            value === o.value ? "bg-ink text-paper" : "text-ink-3 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5 text-left"
    >
      <span className="text-[13px] text-ink">{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-ink" : "bg-ink-4/40",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-all",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

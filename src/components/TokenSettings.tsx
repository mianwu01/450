import { useEffect, useRef, useState } from "react";
import { KeyRound, Check, Trash2, ArrowUpRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { getToken, setToken, maskToken } from "@/lib/token";
import { cn } from "@/lib/utils";

export function TokenSettings({ onSaved }: { onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [reveal, setReveal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [present, setPresent] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPresent(getToken());
  }, [open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function save() {
    setToken(draft);
    setPresent(getToken());
    setDraft("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
    onSaved?.();
  }

  function clear() {
    setToken(null);
    setPresent(null);
    setDraft("");
    onSaved?.();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn("btn", present && "text-mint")}
        title={present ? "GitHub token set" : "Add a GitHub token"}
      >
        <KeyRound className="h-4 w-4" />
        <span className="hidden sm:inline">Token</span>
        {present && <span className="h-1.5 w-1.5 rounded-full bg-mint" />}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-80 rounded-2xl bg-surface p-4 shadow-lift animate-fade-in">
          <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-ink">
            <ShieldCheck className="h-4 w-4 text-mint" />
            GitHub access token
          </div>
          <p className="mb-3 text-[11px] leading-relaxed text-ink-2">
            Optional. Lifts the 60/hr limit to 5,000/hr and unlocks private repos you
            can read. Stored only in this browser; sent only to GitHub.
          </p>

          {present && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-mint-tint px-3 py-2">
              <span className="num font-mono text-[12px] text-mint">{maskToken(present)}</span>
              <button
                onClick={clear}
                className="flex items-center gap-1 text-[11px] text-ink-2 hover:text-p0"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-xl bg-surface-3 px-2.5 py-1.5">
            <input
              type={reveal ? "text" : "password"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && draft.trim() && save()}
              placeholder={present ? "Replace token…" : "ghp_… or github_pat_…"}
              spellCheck={false}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-ink placeholder:text-ink-4 focus:outline-none"
            />
            <button
              onClick={() => setReveal((r) => !r)}
              className="text-ink-3 hover:text-ink"
              title={reveal ? "Hide" : "Show"}
            >
              {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>

          <button onClick={save} disabled={!draft.trim()} className="btn btn-ink mt-3 w-full">
            {saved ? <Check className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
            {saved ? "Saved" : "Save token"}
          </button>

          <a
            href="https://github.com/settings/personal-access-tokens/new"
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-3 hover:text-ink"
          >
            <ArrowUpRight className="h-3 w-3" />
            Create a fine-grained token (read-only · Contents, Issues, PRs)
          </a>
        </div>
      )}
    </div>
  );
}

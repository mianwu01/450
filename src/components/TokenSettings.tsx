import { useEffect, useRef, useState } from "react";
import {
  KeyRound,
  Check,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { getToken, setToken, maskToken } from "@/lib/token";
import { cn } from "@/lib/utils";

/**
 * GitHub token settings. Lets the user paste a read-only personal access token
 * (PAT) so Live mode gets 5,000 req/hr and can read private repos. Stored only
 * in this browser (localStorage); only ever sent to api.github.com.
 */
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
        className={cn("btn px-2.5", present && "border-mint/40 text-mint")}
        title={present ? "GitHub token set" : "Add a GitHub token"}
      >
        <KeyRound className="h-4 w-4" />
        <span className="hidden sm:inline">{present ? "Token" : "Token"}</span>
        {present && <span className="h-1.5 w-1.5 rounded-full bg-mint" />}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-80 rounded-2xl border border-line bg-ink-800/95 p-4 shadow-card backdrop-blur-xl animate-fade-in">
          <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-slate-100">
            <ShieldCheck className="h-4 w-4 text-mint" />
            GitHub access token
          </div>
          <p className="mb-3 text-[11px] leading-relaxed text-slate-400">
            Optional. Lifts the 60/hr limit to 5,000/hr and unlocks private repos
            you can read. Stored only in this browser; sent only to GitHub.
          </p>

          {present && (
            <div className="mb-2 flex items-center justify-between rounded-lg border border-mint/30 bg-mint/5 px-3 py-2">
              <span className="font-mono text-[12px] text-mint">
                {maskToken(present)}
              </span>
              <button
                onClick={clear}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-p0"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-ink-900/60 px-2.5 py-1.5">
            <input
              type={reveal ? "text" : "password"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && draft.trim() && save()}
              placeholder={present ? "Replace token…" : "ghp_… or github_pat_…"}
              spellCheck={false}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-slate-100 placeholder:text-slate-600 focus:outline-none"
            />
            <button
              onClick={() => setReveal((r) => !r)}
              className="text-slate-500 hover:text-slate-300"
              title={reveal ? "Hide" : "Show"}
            >
              {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>

          <button
            onClick={save}
            disabled={!draft.trim()}
            className="btn btn-primary mt-3 w-full"
          >
            {saved ? <Check className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
            {saved ? "Saved" : "Save token"}
          </button>

          <a
            href="https://github.com/settings/personal-access-tokens/new"
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-accent"
          >
            <ExternalLink className="h-3 w-3" />
            Create a fine-grained token (read-only · Contents, Issues, PRs)
          </a>
        </div>
      )}
    </div>
  );
}

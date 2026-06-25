import { useEffect, useRef, useState } from "react";
import { Download, FileJson, FileText, Check, ChevronDown } from "lucide-react";
import type { RepoAnalysisResult } from "@/types/domain";
import { toJSON, toMarkdown, download } from "@/lib/export";

export function ExportMenu({ result }: { result: RepoAnalysisResult }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const slug = result.repoName.replace("/", "_");

  function flash(label: string) {
    setDone(label);
    setTimeout(() => setDone(null), 1400);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="btn">
        {done ? (
          <Check className="h-4 w-4 text-mint" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {done ? `${done}` : "Export"}
        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-line bg-ink-800/95 p-1 shadow-card backdrop-blur-xl animate-fade-in">
          <Item
            icon={FileJson}
            label="Download JSON"
            onClick={() => {
              download(`${slug}_triage.json`, toJSON(result), "application/json");
              flash("Saved JSON");
            }}
          />
          <Item
            icon={FileText}
            label="Download Markdown"
            onClick={() => {
              download(`${slug}_triage.md`, toMarkdown(result), "text/markdown");
              flash("Saved MD");
            }}
          />
          <Item
            icon={FileJson}
            label="Copy JSON"
            onClick={() => {
              navigator.clipboard?.writeText(toJSON(result));
              flash("Copied");
            }}
          />
        </div>
      )}
    </div>
  );
}

function Item({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof FileJson;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-slate-100"
    >
      <Icon className="h-4 w-4 text-slate-500" />
      {label}
    </button>
  );
}

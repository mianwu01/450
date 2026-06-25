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
        {done ? <Check className="h-4 w-4 text-mint" /> : <Download className="h-4 w-4" />}
        {done ? done : "Export"}
        <ChevronDown className="h-3.5 w-3.5 text-ink-3" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-2xl bg-surface p-1 shadow-lift animate-fade-in">
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
      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink"
    >
      <Icon className="h-4 w-4 text-ink-3" />
      {label}
    </button>
  );
}

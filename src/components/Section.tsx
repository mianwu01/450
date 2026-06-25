import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Section({
  icon: Icon,
  title,
  subtitle,
  accent = "text-accent",
  count,
  action,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  accent?: string;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass p-5 animate-fade-up", className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white/[0.03]">
            <Icon className={cn("h-4 w-4", accent)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
              {count != null && (
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-400">
                  {count}
                </span>
              )}
            </div>
            {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white/[0.01] px-4 py-8 text-center text-[13px] text-slate-500">
      {children}
    </div>
  );
}

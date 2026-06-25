import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Section({
  icon: Icon,
  title,
  subtitle,
  iconBg = "bg-surface-3",
  iconColor = "text-ink",
  count,
  action,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  iconBg?: string;
  iconColor?: string;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card p-5 animate-fade-up", className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("grid h-9 w-9 place-items-center rounded-xl", iconBg)}>
            <Icon className={cn("h-[18px] w-[18px]", iconColor)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h2>
              {count != null && (
                <span className="num rounded-full bg-surface-3 px-2 py-0.5 font-mono text-[11px] font-medium text-ink-2">
                  {count}
                </span>
              )}
            </div>
            {subtitle && <p className="text-[12px] text-ink-3">{subtitle}</p>}
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
    <div className="rounded-2xl border border-dashed border-line bg-surface-2 px-4 py-8 text-center text-[13px] text-ink-3">
      {children}
    </div>
  );
}

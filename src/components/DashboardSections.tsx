import { ShieldAlert, GitPullRequest, Hourglass } from "lucide-react";
import type { TodoItem } from "@/types/domain";
import { Section, EmptyHint } from "./Section";
import { TodoCard } from "./TodoCard";

function List({ items, empty }: { items: TodoItem[]; empty: string }) {
  if (!items.length) return <EmptyHint>{empty}</EmptyHint>;
  return (
    <div className="space-y-2.5">
      {items.map((t, i) => (
        <TodoCard key={t.id} todo={t} index={i} />
      ))}
    </div>
  );
}

export function BlockedSection({ items }: { items: TodoItem[] }) {
  return (
    <Section
      icon={ShieldAlert}
      title="Blocked / Needs Decision"
      subtitle="Work that can't move without an unblock or a call"
      iconBg="bg-p0-tint"
      iconColor="text-p0"
      count={items.length}
    >
      <List items={items} empty="Nothing blocked — the path is clear." />
    </Section>
  );
}

export function ReviewQueue({ items }: { items: TodoItem[] }) {
  return (
    <Section
      icon={GitPullRequest}
      title="Review Queue"
      subtitle="Open pull requests awaiting movement"
      iconBg="bg-p2-tint"
      iconColor="text-p2"
      count={items.length}
    >
      <List items={items} empty="No open pull requests to review." />
    </Section>
  );
}

export function StaleItems({ items }: { items: TodoItem[] }) {
  return (
    <Section
      icon={Hourglass}
      title="Stale Items"
      subtitle="Untouched for 30+ days — close, revive, or archive"
      iconBg="bg-p3-tint"
      iconColor="text-p3-ink"
      count={items.length}
    >
      <List items={items} empty="No stale items. Queue is fresh." />
    </Section>
  );
}

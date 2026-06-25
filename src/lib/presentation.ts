import type { TodoPriority, TodoStatus, HealthStatus } from "@/types/domain";

export interface PriorityMeta {
  label: string;
  name: string;
  /** Tailwind text color class. */
  text: string;
  /** Solid accent (for dots / bars). */
  hex: string;
  /** Soft background tint class. */
  soft: string;
  border: string;
  ring: string;
  description: string;
}

export const PRIORITY_META: Record<TodoPriority, PriorityMeta> = {
  P0: {
    label: "P0",
    name: "Critical",
    text: "text-p0",
    hex: "#ff4d6d",
    soft: "bg-p0-soft",
    border: "border-p0/40",
    ring: "ring-p0/40",
    description: "Blocks progress — failing workflow, release blocker, urgent review.",
  },
  P1: {
    label: "P1",
    name: "High",
    text: "text-p1",
    hex: "#ff9f43",
    soft: "bg-p1-soft",
    border: "border-p1/40",
    ring: "ring-p1/40",
    description: "Important active work — high-impact bug, PR needing review, assigned to you.",
  },
  P2: {
    label: "P2",
    name: "Normal",
    text: "text-p2",
    hex: "#4dabf7",
    soft: "bg-p2-soft",
    border: "border-p2/40",
    ring: "ring-p2/40",
    description: "Useful but not urgent — normal feature, cleanup, discussion.",
  },
  P3: {
    label: "P3",
    name: "Low",
    text: "text-p3",
    hex: "#868e96",
    soft: "bg-p3-soft",
    border: "border-p3/40",
    ring: "ring-p3/40",
    description: "Low priority — stale, docs-only, minor or exploratory.",
  },
};

export const PRIORITY_ORDER: TodoPriority[] = ["P0", "P1", "P2", "P3"];

export interface StatusMeta {
  label: string;
  text: string;
  dot: string;
}

export const STATUS_META: Record<TodoStatus, StatusMeta> = {
  blocked: { label: "Blocked", text: "text-p0", dot: "bg-p0" },
  needs_review: { label: "Needs review", text: "text-p2", dot: "bg-p2" },
  needs_implementation: {
    label: "Needs implementation",
    text: "text-p1",
    dot: "bg-p1",
  },
  needs_decision: { label: "Needs decision", text: "text-accent", dot: "bg-accent" },
  needs_triage: { label: "Needs triage", text: "text-slate-300", dot: "bg-slate-400" },
  waiting: { label: "Waiting", text: "text-mint", dot: "bg-mint" },
};

export interface HealthMeta {
  label: string;
  text: string;
  dot: string;
  ring: string;
}

export const HEALTH_META: Record<HealthStatus, HealthMeta> = {
  Stable: { label: "Stable", text: "text-mint", dot: "bg-mint", ring: "ring-mint/30" },
  "High Activity": {
    label: "High Activity",
    text: "text-p2",
    dot: "bg-p2",
    ring: "ring-p2/30",
  },
  "Needs Attention": {
    label: "Needs Attention",
    text: "text-p1",
    dot: "bg-p1",
    ring: "ring-p1/30",
  },
  Blocked: { label: "Blocked", text: "text-p0", dot: "bg-p0", ring: "ring-p0/30" },
};

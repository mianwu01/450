import type { TodoPriority, TodoStatus, HealthStatus } from "@/types/domain";

export interface PriorityMeta {
  label: string;
  name: string;
  hex: string;
  /** soft tint background class */
  tint: string;
  /** readable text-on-tint class */
  onTint: string;
  text: string;
  description: string;
}

// Pastel-but-legible. P0 is coral (deliberately NOT pink).
export const PRIORITY_META: Record<TodoPriority, PriorityMeta> = {
  P0: {
    label: "P0",
    name: "Critical",
    hex: "#F0563E",
    tint: "bg-p0-tint",
    onTint: "text-p0-ink",
    text: "text-p0",
    description: "Blocks progress — failing workflow, release blocker, urgent review.",
  },
  P1: {
    label: "P1",
    name: "High",
    hex: "#E8902B",
    tint: "bg-p1-tint",
    onTint: "text-p1-ink",
    text: "text-p1",
    description: "Important active work — high-impact bug, PR needing review, assigned to you.",
  },
  P2: {
    label: "P2",
    name: "Normal",
    hex: "#3B8FDE",
    tint: "bg-p2-tint",
    onTint: "text-p2-ink",
    text: "text-p2",
    description: "Useful but not urgent — normal feature, cleanup, discussion.",
  },
  P3: {
    label: "P3",
    name: "Low",
    hex: "#7C8B86",
    tint: "bg-p3-tint",
    onTint: "text-p3-ink",
    text: "text-p3",
    description: "Low priority — stale, docs-only, minor or exploratory.",
  },
};

export const PRIORITY_ORDER: TodoPriority[] = ["P0", "P1", "P2", "P3"];

export interface StatusMeta {
  label: string;
  hex: string;
  text: string;
}

export const STATUS_META: Record<TodoStatus, StatusMeta> = {
  blocked: { label: "Blocked", hex: "#F0563E", text: "text-p0-ink" },
  needs_review: { label: "Needs review", hex: "#3B8FDE", text: "text-p2-ink" },
  needs_implementation: { label: "Needs implementation", hex: "#E8902B", text: "text-p1-ink" },
  needs_decision: { label: "Needs decision", hex: "#179A92", text: "text-teal" },
  needs_triage: { label: "Needs triage", hex: "#7C8B86", text: "text-p3-ink" },
  waiting: { label: "Waiting", hex: "#27A877", text: "text-mint" },
};

export interface HealthMeta {
  label: string;
  hex: string;
  text: string;
  tint: string;
}

export const HEALTH_META: Record<HealthStatus, HealthMeta> = {
  Stable: { label: "Stable", hex: "#27A877", text: "text-mint", tint: "bg-mint-tint" },
  "High Activity": { label: "High Activity", hex: "#3B8FDE", text: "text-sky", tint: "bg-sky-tint" },
  "Needs Attention": { label: "Needs Attention", hex: "#E8902B", text: "text-honey", tint: "bg-honey-tint" },
  Blocked: { label: "Blocked", hex: "#F0563E", text: "text-p0", tint: "bg-p0-tint" },
};

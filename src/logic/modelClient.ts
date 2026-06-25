// ─────────────────────────────────────────────────────────────────────────────
// Minimal OpenAI-compatible client for the "local mode" model adapter.
//
// It talks to the local nanoGPT server (server/nanogpt_server.py) over
// /v1/chat/completions, but the shape is provider-neutral: point apiBaseUrl at
// vLLM, a fine-tuned checkpoint, or a hosted API and nothing else changes.
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelHealth {
  ready: boolean;
  model: string;
  device?: string;
  params_m?: number;
  backend?: string;
}

export const NANOGPT_DEFAULT_URL = "http://localhost:8080";

export function normalizeBaseUrl(url: string): string {
  return (url || NANOGPT_DEFAULT_URL).trim().replace(/\/+$/, "");
}

async function withTimeout<T>(p: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await p(ctrl.signal);
  } finally {
    clearTimeout(t);
  }
}

export async function pingHealth(baseUrl: string, timeoutMs = 4000): Promise<ModelHealth> {
  const base = normalizeBaseUrl(baseUrl);
  return withTimeout(async (signal) => {
    const res = await fetch(`${base}/health`, { signal });
    if (!res.ok) throw new Error(`health ${res.status}`);
    return (await res.json()) as ModelHealth;
  }, timeoutMs);
}

export async function chatComplete(
  baseUrl: string,
  messages: ChatMsg[],
  opts: { maxTokens?: number; temperature?: number; apiKey?: string; timeoutMs?: number } = {},
): Promise<string> {
  const base = normalizeBaseUrl(baseUrl);
  return withTimeout(async (signal) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (opts.apiKey) headers.Authorization = `Bearer ${opts.apiKey}`;
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: "POST",
      headers,
      signal,
      body: JSON.stringify({
        messages,
        max_tokens: opts.maxTokens ?? 48,
        temperature: opts.temperature ?? 0.6,
      }),
    });
    if (!res.ok) throw new Error(`model ${res.status}`);
    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    if (!content) throw new Error("empty completion");
    return content.trim();
  }, opts.timeoutMs ?? 30000);
}

// Lightweight GitHub token store. The token is kept in localStorage so it
// survives reloads on a personal machine, and is read by the live adapter to
// (a) lift the unauthenticated 60 req/hr limit to 5,000/hr and (b) read private
// repos the token can see. It is never sent anywhere except api.github.com.

const KEY = "awa.gh_token";

let memory: string | null = null;

export function getToken(): string | null {
  if (memory) return memory;
  try {
    const v = localStorage.getItem(KEY);
    if (v) memory = v;
  } catch {
    /* localStorage unavailable (private mode) — fall back to memory/window */
  }
  // Back-compat: a token poked into the console still works.
  if (!memory && typeof window !== "undefined") {
    const w = (window as unknown as { __GH_TOKEN__?: string }).__GH_TOKEN__;
    if (w) memory = w;
  }
  return memory;
}

export function setToken(token: string | null): void {
  memory = token && token.trim() ? token.trim() : null;
  try {
    if (memory) localStorage.setItem(KEY, memory);
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore persistence failure; memory copy still applies this session */
  }
}

export function hasToken(): boolean {
  return !!getToken();
}

/** "ghp_abcd…wxyz" for display — never show the whole secret. */
export function maskToken(token: string): string {
  if (token.length <= 8) return "•".repeat(token.length);
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}

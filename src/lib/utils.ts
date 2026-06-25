/** Minimal classnames joiner (clsx-lite) — keeps the dep surface small. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Parse "owner/repo" or a github.com URL into a normalized "owner/repo". */
export function parseRepoInput(raw: string): { owner: string; repo: string } | null {
  const s = raw.trim();
  if (!s) return null;

  // Full URL form
  const urlMatch = s.match(/github\.com[/:]([^/]+)\/([^/#?]+)/i);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: stripGit(urlMatch[2]) };
  }

  // owner/repo form
  const slug = s.replace(/^https?:\/\//i, "").replace(/\.git$/i, "");
  const parts = slug.split("/").filter(Boolean);
  if (parts.length === 2 && /^[\w.-]+$/.test(parts[0]) && /^[\w.-]+$/.test(parts[1])) {
    return { owner: parts[0], repo: stripGit(parts[1]) };
  }
  return null;
}

function stripGit(repo: string): string {
  return repo.replace(/\.git$/i, "");
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

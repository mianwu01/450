# Workflow — Academic Workflow Assistant

**GitHub triage slice (frontend milestone)**

A repository-triage app that turns any GitHub repo into a **prioritized,
source-grounded, traceable** work plan. It reads issues, pull requests, and repo
activity, extracts actionable todos, ranks them P0–P3, and links every todo back
to the exact GitHub evidence it came from.

### Design language

Deliberately *not* a generic "AI dashboard." The system is built on:

- **Geist** (Vercel) — Geist Sans for display + UI, **Geist Mono** for every
  number, label, and status (tabular numerals throughout). Self-hosted, offline.
- **Warm "paper" light theme** with soft, rounded, friendly surfaces (inspired by
  the *Intelly* dashboard direction) — shadow-as-border, not glass or glow.
- **One restrained accent** (a lemon, never pink) plus a pastel-but-legible
  priority palette (P0 is coral, not red-glow).
- A **cinematic CSS/SVG landscape hero** — a continuously transforming dawn→day
  vista (panning sky, rising sun, drifting fog, parallax ridges, film grain) that
  **pulls back** from full-bleed into the rounded dashboard banner when you
  Analyze. No images or video — it's all CSS + SVG, so it ships offline.

> This milestone is **read-only**: read → summarize → prioritize → display.
> No issues are closed, no PRs commented or merged, no repository state is changed.

---

## Why it's built this way

This is a **standalone prototype** that deliberately mirrors Nanobot's webui
stack (React 18 + Vite + TypeScript + Tailwind + lucide-react, the same toolchain
as `nanobot/webui`). It is decoupled behind a single adapter seam so the same UI
can later be served by a real Nanobot `gh`-backed tool with **zero UI changes**.

The data flow matches the project's target architecture:

```
GitHub source data
  → adapter intake        (mock OR live public REST API)
  → task extraction       (logic/analyze.ts)
  → priority ranking       (deterministic, explainable P0–P3)
  → evidence store          (every todo carries its source snippets)
  → dashboard               (this UI)
```

---

## How to run

```bash
cd project/github-workflow-dashboard
npm install        # already run once; deps are in node_modules

npm run demo       # ⭐ build + serve production preview at http://localhost:5273
#   — or —
npm run dev        # hot-reload dev server (same URL)
```

`npm run demo` is the recommended way to present: it serves the optimized
production build (no dev overlay, fastest, most stable). Requirements: Node ≥ 18
(built & verified on Node 22).

### Running on a personal Windows PC

The project is pure Node + Vite — no native modules, no OS-specific scripts — so
it runs the same on Windows.

1. Install **Node.js LTS** from <https://nodejs.org> (the installer adds `node`
   and `npm` to PATH).
2. Copy this `github-workflow-dashboard/` folder to your PC (you do **not** need
   the rest of the repo, and you can delete `node_modules` before copying —
   `npm install` rebuilds it).
3. Open **PowerShell** or **Command Prompt** in the folder and run:
   ```powershell
   npm install
   npm run demo
   ```
4. Open <http://localhost:5273> in your browser. Internet access (Live mode)
   works out of the box; add a token via the **Token** button for higher limits
   and private repos.

> The dev/preview servers bind to `--host`, so you can also open the app from
> another device on your LAN via the printed `Network:` URL.

---

## 🎤 Presenting — 90-second demo script

> **Stays in offline Sample mode the whole time — zero network risk on stage.**

1. **Open** `http://localhost:5273`. Land on the welcome screen. Say: *"This is the
   GitHub slice of our Academic Workflow Assistant — it turns a repo into a
   prioritized, traceable work plan."* The three cards name the CTQs:
   source-grounded, traceable, read-only.
2. **Click Analyze** (the repo is prefilled). Narrate the staged loader:
   *"It reads metadata, issues, and PRs, extracts todos, ranks them, and builds a
   trace log"* — this is the agent pipeline, visible.
3. **Repo overview lands** with a pulsing **Blocked** health pill. Say: *"It
   detected a CI outage on main — the repo is blocked."*
4. **Today's Focus** — point at the top 3–5. *"Highest-leverage first: the hotfix
   that unblocks CI, the red build, the release blocker."*
5. **Expand one card's Evidence drawer.** This is the money shot for the
   traceability CTQ: *"Every todo links to the exact issue/PR, the snippet it was
   extracted from, the generated rationale, suggested next action, and a
   confidence score — nothing is invented."*
6. **Show control**: toggle **Streams ⇄ Board**, click a priority in the sidebar
   to filter, then **Export → Markdown**. *"The whole triage exports for a lab log."*
7. Close: *"Read-only by design — no writes this milestone — and the GitHub source
   sits behind one adapter, so a real Nanobot `gh` tool drops in with no UI change."*

**If asked "does it work on a real repo?"** flip the toggle to **Live**, type
`facebook/react`, Analyze. (Needs network; unauthenticated GitHub = 60 req/hr.
Keep this as the optional encore, not the main path.)

---

## How to test with a sample repository

**Sample mode (default — offline, always works, best for demos)**

1. Open the app. The input is prefilled with `hkuds/academic-workflow-agent`.
2. Click **Analyze** (or press Enter). Watch the staged loading sequence.
3. You'll get a curated, realistic scenario: a CI crisis that drives the repo to
   **Blocked** health, a full P0 column (red-main hotfix, release blocker), a
   Review Queue, and Stale items. Distribution: P0×4, P1×1, P2×4, P3×6.
4. Try the example chips, the **Streams / Board** view toggle, the filters
   (priority / source / status / assignee / label / search), expand a card's
   **Evidence** drawer, and **Export** to JSON or Markdown.

> In Sample mode you can type *any* `owner/repo` — the repo header is relabeled
> to your input while the curated issue/PR set is reused, so the demo never breaks.

**Live mode (real, read-only GitHub data over the internet)**

1. Flip the toggle in the search bar from **Sample** to **Live**.
2. Enter any public repo, e.g. `vercel/swr` or `vercel/next.js`, and Analyze.
3. The app fetches repo metadata + open issues + open PRs directly from
   `api.github.com` — **no token needed** for public repos. (Verified live:
   `vercel/swr` → 20 issues + 30 PRs → 50 ranked todos in ~2.6s.)

GitHub allows the browser to call its API directly (`Access-Control-Allow-Origin: *`),
so this works from any machine with internet — nothing to host.

**Optional token (recommended for real use)** — click the **Token** button
(top-right) and paste a GitHub personal access token. This:
- raises the limit from **60 → 5,000 requests/hour**;
- unlocks **private repos** the token can read;
- enriches each PR with its **real review state + CI/check status** (without a
  token, Live mode skips those per-PR calls to conserve the 60/hr budget).

Create a **fine-grained, read-only** token at
<https://github.com/settings/personal-access-tokens/new> (repo access →
*Contents*, *Issues*, *Pull requests*: Read-only). It's stored only in your
browser's `localStorage` and is only ever sent to `api.github.com`.

The polished error states (invalid repo, not found, rate limit, private/401,
network, empty queue) are all wired and demo-ready.

---

## Files

```
project/github-workflow-dashboard/
├── index.html                      # warm paper light theme, minimal mark
├── package.json / vite / tsconfig / tailwind / postcss
├── src/
│   ├── main.tsx · App.tsx          # app shell + state machine + hero pull-back layout
│   ├── index.css                   # design system: paper surfaces + cinematic scene
│   ├── types/domain.ts             # ← the data contract (TodoItem, RepoAnalysisResult, …)
│   ├── data/mockData.ts            # curated realistic intake bundle
│   ├── adapters/
│   │   ├── types.ts                # GitHubAdapter interface + AnalysisError
│   │   ├── mockAdapter.ts          # offline curated data
│   │   ├── liveAdapter.ts          # read-only public GitHub REST API
│   │   └── index.ts                # runAnalysis() orchestrator + staged steps
│   ├── logic/
│   │   ├── analyze.ts              # extraction + deterministic P0–P3 ranker + health
│   │   └── selectors.ts            # focus / blocked / review / stale / filtering
│   ├── lib/
│   │   ├── utils.ts · format.ts    # repo parsing, relative time, compact numbers
│   │   ├── presentation.ts         # priority/status/health design tokens
│   │   ├── token.ts                # GitHub token store (localStorage)
│   │   └── export.ts               # JSON + Markdown export
│   └── components/
│       ├── CinematicScene.tsx      # pure CSS/SVG dawn→day landscape (no assets)
│       ├── HeroStage.tsx           # full-bleed → docked banner pull-back + overview
│       ├── Sidebar.tsx             # repos + priority breakdown + quick filters
│       ├── RepoInput.tsx           # owner/repo input + Sample/Live toggle
│       ├── TodaysFocus.tsx         # top 3–5 tasks
│       ├── PriorityColumn.tsx      # P0/P1/P2/P3 board
│       ├── TodoCard.tsx            # the card (+ expandable evidence)
│       ├── EvidenceDrawer.tsx      # trace: rationale + source-grounded snippets
│       ├── DashboardSections.tsx   # Blocked / Review Queue / Stale
│       ├── DashboardFilters.tsx    # priority/source/status/assignee/label/search
│       ├── AnalysisLoadingState.tsx# staged "agent thinking" sequence
│       ├── EmptyStates.tsx         # error + welcome states
│       ├── ExportMenu.tsx          # JSON / Markdown / copy
│       ├── TokenSettings.tsx       # GitHub token popover (Live mode auth)
│       └── PriorityBadge · StatusBadge · ConfidenceMeter · Section
```

---

## Assumptions made

- **The "existing Nanobot codebase"** lives under another user's space
  (`/mnt/cpfs/zpy/hub/nanobot`) and isn't a repo you own. Per the chosen
  direction this is built **standalone** in your project folder, mirroring
  Nanobot's stack so it lifts in cleanly later. It does **not** modify Nanobot.
- **GitHub access in Nanobot today is the `gh` CLI skill** (`nanobot/skills/github`),
  not an HTTP connector. The `liveAdapter` uses the public REST API directly for
  the prototype; a Nanobot `gh`-backed tool can implement the same
  `GitHubAdapter` interface later.
- **Prioritization is a deterministic, explainable ranker** (the requested
  placeholder), not an LLM. Every score contribution is recorded as a
  human-readable reason so each card can justify *why this matters* / *why this
  priority*. Swapping in an LLM judge = replacing `scoreItem` in `analyze.ts`.
- **Live PR enrichment is token-gated.** With a token, Live mode fetches each
  PR's real review state + CI/check status (capped at 20 PRs, fanned out 5 at a
  time, best-effort — failures degrade gracefully). *Without* a token it skips
  those per-PR calls to stay within the 60/hr unauthenticated budget, so live
  PRs show `checks: none`. The Sample dataset always shows the full review/CI
  states.
- `confidence` is heuristic (signal density), shown as an honest extractor
  confidence meter, not a model probability.

---

## Remaining TODOs — connecting to full Nanobot orchestration

1. **Replace the adapter with a Nanobot tool.** Implement `GitHubAdapter` over
   the `gh` CLI skill (or a FastAPI trace-agent endpoint) and register it in
   `adapters/index.ts`. The UI needs no changes.
2. **Swap the ranker for a model adapter.** Keep `analyze.ts`'s signature; back
   `scoreItem` / rationale generation with an LLM judge behind the same
   deterministic fallback.
3. **Wire real traceability IDs.** Persist evidence to the Nanobot evidence store
   and carry stable trace IDs end-to-end (the UI already renders per-todo
   evidence + timestamps + confidence).
4. **Enrich live PRs** with review + CI status via `gh pr checks` / the checks API.
5. **Lift into `nanobot/webui`** as a `/repo-triage` route (same React/Vite/Tailwind
   stack) once the tool boundary is finalized.
6. **(Future, out of scope)** Approval-gated write actions, plus the paper/PDF,
   deadline, and lab-log workflow slices — reusing the same `Evidence` type.

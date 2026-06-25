# Local mode — nanoGPT inference server

This is the **local model adapter** for the dashboard. It serves
[nanoGPT](https://github.com/karpathy/nanoGPT) (GPT‑2 weights, loaded via
nanoGPT's `model.py`) behind an **OpenAI-compatible** `/v1/chat/completions`
endpoint. The browser app calls it exactly as it would a hosted API, so the same
frontend code can later point at vLLM, Claude, or a fine-tuned local checkpoint
with no changes.

> **Honest scope.** GPT‑2 is a *base* model (text continuation, not instruction
> tuned), so its prose is rough and sometimes repetitive. The dashboard keeps the
> **deterministic ranker** as the backbone (priorities, status, evidence) and uses
> this server only for the natural-language **"workflow brief"** — which proves the
> local-inference path runs end to end.

## Prerequisites

- Python 3.10+, with `torch`, `transformers`, `tiktoken`, `fastapi`, `uvicorn`
  (`pip install -r server/requirements.txt`).
- A clone of nanoGPT (has `model.py`). Point `NANOGPT_DIR` at it
  (default `/mnt/cpfs/yza/nanoGPT`):
  ```bash
  git clone https://github.com/karpathy/nanoGPT
  export NANOGPT_DIR="$PWD/nanoGPT"
  ```
- GPT‑2 weights cached once (auto-downloads on first load, ~500 MB). nanoGPT
  ships a robust prefetch helper if your network needs it:
  ```bash
  python "$NANOGPT_DIR/download_inference.py" --model gpt2   # optional
  ```

## Run

```bash
bash server/run_nanogpt.sh          # gpt2 · cpu · http://localhost:8080
```

First boot loads GPT‑2 once (a few seconds to ~1 min), then serves fast. Verify:

```bash
curl -s localhost:8080/health
# {"status":"ok","ready":true,"model":"gpt2","device":"cpu","params_m":124.4,...}
```

### Configuration (env)

| var              | default              | notes                                          |
|------------------|----------------------|------------------------------------------------|
| `NANOGPT_DIR`    | `/mnt/cpfs/yza/nanoGPT` | path to the nanoGPT repo (needs `model.py`) |
| `NANOGPT_MODEL`  | `gpt2`               | `gpt2` · `gpt2-medium` · `gpt2-large` · `gpt2-xl` |
| `NANOGPT_DEVICE` | `cpu`                | `cuda` / `cuda:0` if you have a free GPU        |
| `NANOGPT_PORT`   | `8080`               | server port                                    |

CPU is the default because it needs no GPU and avoids contention on a shared
node; nanoGPT's sampler has no KV cache, so a brief takes a few seconds on CPU.

## Drive it from the dashboard (end to end)

1. Start this server (above).
2. `npm run dev` in `github-workflow-dashboard/`, open the app.
3. **Academic Workflow Assistant → Model & API → choose "nanoGPT (local)"**
   (the base URL auto-fills to `http://localhost:8080`). Click **Test connection**
   — it shows `nanoGPT · gpt2 · cpu · 124.4M`.
4. **Analyze** a repo. The dashboard renders immediately (deterministic), and a
   **Workflow brief** generated on-device by nanoGPT streams into the top panel.
   The header **Engine** chip shows a green dot while the local model is reachable.

If the server is down, the dashboard still works fully — the brief panel just
shows a "start the server" hint.

## Endpoints

- `GET /health` → readiness + model/device/params.
- `POST /v1/chat/completions` → OpenAI-shaped: `{messages, max_tokens, temperature}`
  → `{choices:[{message:{role,content}}], usage, backend:"nanoGPT"}`.

"""
Local nanoGPT inference server for the Academic Workflow Assistant.

A thin, OpenAI-compatible generation service backed by Karpathy's nanoGPT
(GPT-2 weights loaded via nanoGPT's `model.py`). It is the "local mode" model
adapter for the dashboard: the browser talks to it over /v1/chat/completions,
exactly as it would to a hosted API, so the same frontend code can later point
at vLLM, Claude, or a fine-tuned local checkpoint with no changes.

Honest scope: GPT-2 is a *base* model (text continuation, not instruction
tuned), so its prose is rough. The dashboard keeps the deterministic ranker as
the backbone (priorities/status) and uses this server for the natural-language
"workflow brief" — proving the local-inference path end to end.

Run:
    bash server/run_nanogpt.sh           # cpu, gpt2, port 8080
Env:
    NANOGPT_DIR     path to the nanoGPT repo (has model.py)   [/mnt/cpfs/yza/nanoGPT]
    NANOGPT_MODEL   gpt2 | gpt2-medium | gpt2-large | gpt2-xl [gpt2]
    NANOGPT_DEVICE  cpu | cuda | cuda:0                        [cpu]
    NANOGPT_PORT    port                                       [8080]
"""
from __future__ import annotations

import os
import sys
import time
import threading
import uuid
from contextlib import asynccontextmanager

import torch
import tiktoken
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

NANOGPT_DIR = os.environ.get("NANOGPT_DIR", "/mnt/cpfs/yza/nanoGPT")
MODEL_TYPE = os.environ.get("NANOGPT_MODEL", "gpt2")
DEVICE = os.environ.get("NANOGPT_DEVICE", "cpu")
BLOCK_SIZE = 1024

# Import nanoGPT's GPT class from the repo without modifying it.
if NANOGPT_DIR not in sys.path:
    sys.path.insert(0, NANOGPT_DIR)

_STATE: dict = {"ready": False, "model": None, "enc": None, "loaded_at": None}
_LOCK = threading.Lock()  # the model is single-instance; serialize generation


def _load() -> None:
    from model import GPT  # nanoGPT/model.py

    t0 = time.time()
    model = GPT.from_pretrained(MODEL_TYPE, dict(dropout=0.0))
    model.eval()
    model.to(DEVICE)
    enc = tiktoken.get_encoding("gpt2")
    _STATE.update(
        model=model,
        enc=enc,
        ready=True,
        loaded_at=time.time(),
        load_secs=round(time.time() - t0, 1),
        params_m=round(sum(p.numel() for p in model.parameters()) / 1e6, 1),
    )
    print(f"[nanogpt] {MODEL_TYPE} ready on {DEVICE} "
          f"({_STATE['params_m']}M params, {_STATE['load_secs']}s)", flush=True)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    print(f"[nanogpt] loading {MODEL_TYPE} from {NANOGPT_DIR} on {DEVICE} …", flush=True)
    _load()
    yield


app = FastAPI(title="nanoGPT local server", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@torch.no_grad()
def _generate(prompt: str, max_new_tokens: int, temperature: float, top_k: int) -> tuple[str, int, int]:
    enc = _STATE["enc"]
    model = _STATE["model"]
    ids = enc.encode(prompt, allowed_special=set())
    # keep the model within its context window
    keep = max(1, BLOCK_SIZE - max_new_tokens)
    if len(ids) > keep:
        ids = ids[-keep:]
    x = torch.tensor([ids], dtype=torch.long, device=DEVICE)
    with _LOCK:
        y = model.generate(x, max_new_tokens=max_new_tokens,
                           temperature=max(0.05, temperature), top_k=top_k)
    out_ids = y[0].tolist()[len(ids):]
    text = enc.decode(out_ids)
    return text, len(ids), len(out_ids)


def _clean(text: str) -> str:
    """Trim a base-model continuation into one tidy line."""
    text = text.replace("\r", "").strip()
    # stop at a blank line or an obvious new section
    for stop in ("\n\n", "\nIssue:", "\nPR:", "\n#", "\nRepository"):
        i = text.find(stop)
        if i != -1:
            text = text[:i]
    text = text.split("\n")[0].strip()
    # cut to the last sentence boundary if we have one
    cut = max(text.rfind("."), text.rfind("!"), text.rfind("?"))
    if cut >= 24:
        text = text[: cut + 1]
    return text.strip(" -•\t").strip()


# ── OpenAI-compatible surface ─────────────────────────────────────────────────
class Message(BaseModel):
    role: str = "user"
    content: str = ""


class ChatRequest(BaseModel):
    model: str | None = None
    messages: list[Message] = []
    max_tokens: int = 48
    temperature: float = 0.6
    top_k: int = 40
    clean: bool = True


@app.get("/health")
def health():
    return {
        "status": "ok" if _STATE["ready"] else "loading",
        "ready": _STATE["ready"],
        "model": MODEL_TYPE,
        "device": DEVICE,
        "params_m": _STATE.get("params_m"),
        "load_secs": _STATE.get("load_secs"),
        "backend": "nanoGPT",
    }


@app.get("/")
def root():
    return {"service": "nanoGPT local server", **health()}


@app.post("/v1/chat/completions")
def chat_completions(req: ChatRequest):
    if not _STATE["ready"]:
        return {"error": {"message": "model still loading", "type": "unavailable"}}
    prompt = "\n".join(m.content for m in req.messages if m.content).strip()
    max_new = max(1, min(int(req.max_tokens), 128))
    raw, ptok, ctok = _generate(prompt, max_new, float(req.temperature), int(req.top_k))
    content = _clean(raw) if req.clean else raw
    return {
        "id": "chatcmpl-" + uuid.uuid4().hex[:24],
        "object": "chat.completion",
        "created": int(time.time()),
        "model": MODEL_TYPE,
        "backend": "nanoGPT",
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": ptok,
            "completion_tokens": ctok,
            "total_tokens": ptok + ctok,
        },
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("NANOGPT_PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")

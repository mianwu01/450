#!/usr/bin/env bash
# Launch the local nanoGPT inference server for the dashboard's "local mode".
# Loads GPT-2 once (~50s on CPU), then serves /v1/chat/completions on :8080.
set -euo pipefail

# --- config (override via env) ---
export NANOGPT_DIR="${NANOGPT_DIR:-/mnt/cpfs/yza/nanoGPT}"
export NANOGPT_MODEL="${NANOGPT_MODEL:-gpt2}"      # gpt2 | gpt2-medium | gpt2-large | gpt2-xl
export NANOGPT_DEVICE="${NANOGPT_DEVICE:-cpu}"     # cpu is safest on a shared GPU node
export NANOGPT_PORT="${NANOGPT_PORT:-8080}"

# Use the cached GPT-2 weights + nanoGPT's tiktoken cache; stay offline.
export HF_HUB_OFFLINE="${HF_HUB_OFFLINE:-1}"
export TRANSFORMERS_OFFLINE="${TRANSFORMERS_OFFLINE:-1}"
export TIKTOKEN_CACHE_DIR="${TIKTOKEN_CACHE_DIR:-$NANOGPT_DIR/.tiktoken_cache}"
export TOKENIZERS_PARALLELISM=false

if [ ! -f "$NANOGPT_DIR/model.py" ]; then
  echo "ERROR: nanoGPT not found at NANOGPT_DIR=$NANOGPT_DIR (need model.py)." >&2
  echo "Clone it (git clone https://github.com/karpathy/nanoGPT) and set NANOGPT_DIR." >&2
  exit 1
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "[run] nanoGPT=$NANOGPT_MODEL device=$NANOGPT_DEVICE port=$NANOGPT_PORT dir=$NANOGPT_DIR"
exec python3 "$HERE/nanogpt_server.py"

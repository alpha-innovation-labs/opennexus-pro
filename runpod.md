# Run Qwen3.6-35B-A3B on Runpod (RTX 3090) — Max TPS

## Overview

This guide documents how to deploy Qwen3.6-35B-A3B (a 35B-parameter Mixture-of-Experts model with 3B active parameters per token) on an NVIDIA RTX 3090 (24GB VRAM) via Runpod, using vLLM as the inference engine for maximum tokens-per-second (TPS) throughput.

## Why vLLM over Ollama?

- **Ollama** is designed for local CLI/desktop use — single request, no concurrency, no API endpoint.
- **vLLM** serves an OpenAI-compatible API, handles concurrent requests via continuous batching, and delivers ~100 tok/s on a single RTX 3090.
- For cloud GPU inference on Runpod, vLLM is the correct engine. Ollama does not scale to production traffic.

## Step 1: Launch a Runpod Pod

1. Navigate to **Runpod Console → Pods → GPU Cloud**
2. Select **RTX 3090 (24GB)**
3. Container image: `vllm/vllm-openai:latest`
4. Attach a **Network Volume** (≥50GB) mounted at `/root/.cache/huggingface` — this caches model weights so pod restarts load in ~20 seconds instead of ~3 minutes (no re-download).
5. Expose port **8000** so the proxy generates a public HTTPS endpoint: `https://{POD_ID}-8000.proxy.Runpod.net`
6. Add your HuggingFace token as environment variable `HF_TOKEN` (required for gated models).

## Step 2: Start Command

Use this as the pod's start command:

```bash
python -m vllm.entrypoints.api_server \
  --model Qwen/Qwen3.6-35B-A3B \
  --dtype float16 \
  --gpu-memory-utilization 0.90 \
  --max-model-len 65536 \
  --max-num-seqs 256 \
  --port 8000
```

### Flag explanations

| Flag | Value | Purpose |
|---|---|---|
| `--model` | `Qwen/Qwen3.6-35B-A3B` | The model identifier on HuggingFace Hub |
| `--dtype` | `float16` | RTX 3090 (Ampere architecture) runs float16 faster than bfloat16 in practice |
| `--gpu-memory-utilization` | `0.90` | Reserves 90% of 24GB VRAM for the KV cache. The remaining 10% is headroom for CUDA overhead and model weight activations. Below 0.85 wastes KV cache capacity; above 0.95 risks OOM on long prompts. |
| `--max-model-len` | `65536` | 64K token context window (prompt + completion). Adjust to 128K if needed, but it reduces concurrent capacity. |
| `--max-num-seqs` | `256` | Controls how many requests vLLM processes simultaneously during continuous batching. Higher = more throughput, higher latency per request. 128-256 is suitable for interactive chat. |
| `--port` | `8000` | Must match the exposed port in Runpod settings. |

### Multi-GPU (Tensor Parallelism)

For multi-GPU pods (e.g., 2× RTX 3090), add `--tensor-parallel-size 2` and set the env var `VLLM_WORKER_MULTIPROC_METHOD=spawn`. Tensor parallelism shards weights across GPUs, with NVLink handling all-reduce communication.

## Step 3: Maximum TPS on a Single RTX 3090

| Model | Quantization | VRAM Used | Generation TPS | Notes |
|---|---|---|---|---|
| Qwen3.6-35B-A3B | UD-Q4_K_XL (Unsloth) | ~24 GB | **~100-101 tok/s** | Fully on-GPU, no CPU offload. **Best single-3090 speed.** |
| Qwen3.6-27B dense | Q4_K_M | ~21 GB | ~25-35 tok/s | Slower but more KV cache headroom |
| Qwen3.6-27B dense | Q4_K_M + DFlash | ~21 GB | ~60-78 tok/s | DFlash (2x speedup) only works on dense models, not MoE |

### Key insight: MoE vs Dense

The 35B-A3B is a Mixture-of-Experts model: 35B total parameters but only ~3B are active per token. This means it runs 3B's worth of math per forward pass while consuming VRAM like a 35B model. On an RTX 3090, the MoE achieves ~100 tok/s — roughly 3x faster than the 27B dense model (~25-35 tok/s) — despite being larger on disk (22.4 GB vs 17 GB).

**When to pick 35B-A3B (MoE):** Fast everyday chat, RAG workloads, general knowledge, multilingual.

**When to pick 27B dense:** Coding/agentic workloads with tool-call reliability, DFlash speedup, strict instruction-following under heavy system prompts.

## Step 4: Test the Endpoint

Verify the pod has loaded successfully (check pod logs for `INFO: Application startup complete.`), then test:

```bash
curl https://{POD_ID}-8000.proxy.Runpod.net/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen3.6-35B-A3B",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

The response follows the standard OpenAI Chat API format. Any existing OpenAI SDK client works by overriding `base_url` and `api_key`.

**Security:** vLLM does not enforce API key authentication by default. Add `--api-key YOUR_SECRET_KEY` to the start command to prevent unauthorized access to your endpoint.

## Step 5: Production Tuning

| Tuning lever | Recommendation | Effect |
|---|---|---|
| `--max-num-seqs` | 128 | Lower latency per request, less concurrency |
| `--max-num-seqs` | 512+ | Higher throughput for batch inference (ignores per-request latency) |
| `--max-model-len` | 128K | Longer context, reduces concurrent capacity |
| `--max-num-batched-tokens` | Match `--max-model-len` | Controls continuous batching aggressiveness. Lower for interactive chat, higher for batch pipelines. |

### Monitoring

vLLM exposes Prometheus metrics at `/metrics` on port 8000. Key metrics:

- `vllm:num_requests_running` — current queue depth (sustained spikes = saturated server)
- `vllm:gpu_cache_usage_perc` — KV cache utilization (above 90% = OOM risk on long prompts)
- `vllm:request_success_total` — throughput counter; use `rate()` for requests/sec

## Common Failure Modes

| Symptom | Cause | Fix |
|---|---|---|
| CUDA OOM on startup | Insufficient VRAM for model + KV cache | Reduce `--gpu-memory-utilization` to 0.85, use a quantized model, or upgrade GPU |
| Port not reachable (502/connection refused) | Port 8000 not listed in Runpod "Exposed Ports" | Add port 8000 in pod configuration, not just Dockerfile |
| Model download fails (401 Unauthorized) | Missing or invalid HuggingFace token | Set `HF_TOKEN` env var and accept the model license on HuggingFace Hub |

## Persistent Pod vs. Runpod Serverless

- **Persistent Pod:** More economical for steady baseline traffic. You pay per-second even when idle.
- **Runpod Serverless:** Better for bursty traffic. Bills per request, scales to zero (no idle cost), but requires a handler function wrapper rather than a direct container deployment. Sub-200ms cold starts via FlashBoot.

## Reference

The definitive benchmarking resource is the [Qwen3.6 RTX 3090 Lab](https://github.com/tfriedel/qwen3.6-rtx3090-lab) by tfriedel, which provides measured TPS numbers and GPU saturation data for Qwen3.6-35B-A3B on 1-4× RTX 3090 configurations.

# Local LLM Inference Servers (OpenAI API Compatible)

Tools that run LLMs locally and expose OpenAI-compatible APIs including `/v1/models`.

---

## Dedicated Inference Servers

1. **vLLM** — High-throughput production serving on NVIDIA GPUs. PagedAttention + continuous batching. Exposes `/v1/chat/completions`, `/v1/models`, embeddings. Python, CUDA only.
2. **Ollama** — Model management + background API server on port 11434. Wraps llama.cpp. macOS/Linux/Windows. `/v1/chat/completions`, `/v1/models`.
3. **LM Studio** — Desktop app with built-in Developer tab HTTP server on port 1234. OpenAI + Anthropic-compatible APIs. Cross-platform.
4. **llama.cpp (llama-server)** — C/C++ inference engine. Ships `./server` binary with OpenAI-compatible API. Runs on CPU, Apple Silicon, consumer GPUs. GGUF format.
5. **LocalAI** — Full OpenAI API drop-in replacement (chat, embeddings, images, audio, TTS). Multi-backend (gguf, transformers, diffusers). Docker + bare metal.
6. **SGLang** — RadixAttention for agentic pipelines, structured output, VLMs. OpenAI-compatible API. GPU-first (NVIDIA).
7. **Jan AI** — Open-source ChatGPT alternative. Built-in server on port 1337 (powered by llama.cpp/nitro). OpenAI-compatible API.
8. **llamafile** (Mozilla) — Single self-executable file with embedded OpenAI-compatible HTTP server on port 8080. Cross-platform, no dependencies.
9. **TensorRT-LLM** (NVIDIA) — Highest throughput on NVIDIA hardware. Compiles to TensorRT engines. Custom API (not strictly OpenAI-compatible, but has REST wrappers).
10. **LMDeploy** (Shanghai AI Lab) — TurboMind engine, quantized model support, long-context. REST API. GPU-focused.
11. **MLX / mlx-lm** (Apple) — Native Apple Silicon inference. `mlx_lm.server` exposes OpenAI-compatible `/v1/chat/completions` and `/v1/models`.
12. **mlx-openai-server** — Community FastAPI wrapper around MLX models. Chat, multimodal, embeddings, Whisper. OpenAI-compatible.
13. **oMLX** — macOS-native server on mlx-lm with persistent SSD KV caching. OpenAI + Anthropic-compatible APIs. Apple Silicon only, macOS 15+.
14. **Lemonade / LemonadeSDK** (AMD) — Community-built, AMD-optimized. OpenAI, Anthropic, and Ollama-compatible APIs.
15. **Docker Model Runner** — Brings model serving into Docker CLI. `docker model run` exposes OpenAI-compatible endpoint automatically.
16. **KoboldCpp** — Fast inference for consumer GPUs. Web UI + HTTP API with OpenAI-compatible endpoints.
17. **exllamav2** — High-performance inference library for NVIDIA GPUs. CLI-focused, but can be wrapped for API access.
18. **GPT4All** — All-in-one desktop app. Limited API exposure but has a simple server mode.
19. **h2oGPT** — Feature-rich private chat with RAG. Supports Ollama, llama.cpp backends. Has API endpoints.
20. **text-generation-webui** (oobabooga) — Gradio web UI supporting transformers, GPTQ, AWQ, EXL2, llama.cpp backends. Has HTTP API.
21. **open-webui** — ChatGPT-like web UI for LLM backends. Connects to Ollama, OpenAI API, etc.
22. **LiteLLM Proxy** — Unified API proxy/gateway (not an inference engine itself). Routes to any backend (Ollama, vLLM, OpenAI, etc.). Exposes OpenAI-compatible endpoints.
23. **Harbor** (av) — CLI tool that spins up full local LLM stack (Ollama, llama.cpp, vLLM backends + Open WebUI frontend).
24. **OpenLLM** (BentoML) — Model repository + CLI (`openllm serve`) exposing OpenAI-compatible `/v1/chat/completions` and `/v1/models` on port 3000. Built-in chat UI. Supports model catalog, custom repos, BentoCloud cloud deployment. Python, Docker, Kubernetes. 12.4k GitHub stars.

---

## Quick comparison by hardware

| Hardware | Best options (with `/v1/models`) |
|---|---|
| **NVIDIA GPU (production)** | vLLM, SGLang, TensorRT-LLM, LMDeploy, OpenLLM |
| **Apple Silicon (Mac)** | Ollama, MLX/mlx-lm, oMLX, llama.cpp, LM Studio, Jan, OpenLLM |
| **AMD GPU** | Lemonade, SGLang, vLLM, KoboldCpp |
| **CPU / Edge / Low RAM** | llama.cpp, llamafile, Ollama, LM Studio, Jan |
| **Any (Docker)** | LocalAI, Docker Model Runner, Ollama, OpenLLM |

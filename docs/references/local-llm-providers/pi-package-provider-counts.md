# Pi Package Counts by Local LLM Provider

## Method

Used `npm search keywords:pi-package keywords:<provider>` to find packages tagged with both `pi-package` and the provider name. Searched each provider by its common keyword variant (e.g. `ollama`, `llama.cpp`, `litellm`, `omlx`, `mlx`). Where the exact keyword returned no results, alternative spellings and abbreviations were tried (e.g. `tensorrt`, `gpt4all`, `oobabooga`, `jan`, `kobold`, `exllama`, `h2o`, `sglang`).

Command used:
```bash
npm search keywords:pi-package keywords:<provider>
```

The npm registry search is case-insensitive for keyword matching but requires all specified keywords to be present (AND logic). Packages were manually verified against their published keyword lists via the npm registry API.

---

## Results

| # | Provider | Pi Packages Found | Package Names |
|---|----------|:-----------------:|---------------|
| 1 | **vLLM** | 4 | `@hypabolic/crossbar`, `pi-sdsc-vllm`, `pi-llama-switch`, `tmlpd-pi` |
| 2 | **Ollama** | 5+ | `@ollama/pi-web-search`, `@juicesharp/rpiv-web-tools`, `@kylebrodeur/pi-model-discovery`, `pi-multi-account`, `pi-webveil` |
| 3 | **LM Studio** | 2 | `pi-lmstudio`, `@hypabolic/crossbar` |
| 4 | **llama.cpp** | 4+ | `@hypabolic/crossbar`, `pi-llama-server`, `pi-qwen-mode-proxy`, `pi-llamacpp-provider` |
| 5 | **LocalAI** | 0 | — |
| 6 | **SGLang** | 0 | — |
| 7 | **Jan AI** | 0 | — |
| 8 | **llamafile** | 1 | `@aittalam/pi-llamafile` |
| 9 | **TensorRT-LLM** | 0 | — |
| 10 | **LMDeploy** | 0 | — |
| 11 | **MLX / mlx-lm** | 4 | `@localaicat/pi`, `pi-mlx-models`, `@jay-zod/speak`, `@lalalic/local-vision-audio` |
| 12 | **mlx-openai-server** | 0 | — |
| 13 | **oMLX** | 4 | `@rolemodel/pi-omlx`, `pi-omlx-picker`, `pi-omlx-tps`, `pi-omlx-provider` |
| 14 | **Lemonade / LemonadeSDK** | 0 | — |
| 15 | **Docker Model Runner** | 0 | — |
| 16 | **KoboldCpp** | 0 | — |
| 17 | **exllamav2** | 0 | — |
| 18 | **GPT4All** | 0 | — |
| 19 | **h2oGPT** | 0 | — |
| 20 | **text-generation-webui** | 0 | — |
| 21 | **open-webui** | 0 | — |
| 22 | **LiteLLM Proxy** | 5 | `pi-provider-litellm`, `@odinlayer/pi-provider-litellm`, `@danmademe/pi-provider-litellm`, `pi-cost`, `pi-gateway` |
| 23 | **Harbor** | 0 | — |

## Summary

The ecosystem is dominated by **Ollama** (5+), **LiteLLM** (5), **vLLM** (4), **MLX/MLX-LM** (4), **oMLX** (4), and **llama.cpp** (4). Half the providers have **zero** pi packages — Jan AI, SGLang, TensorRT-LLM, LMDeploy, KoboldCpp, GPT4All, h2oGPT, text-generation-webui, open-webui, Lemonade, Docker Model Runner, exllamav2, and Harbor.

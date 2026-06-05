# Odysseus Analysis

> Self-hosted AI workspace inspired by ChatGPT/Claude UI experience. Running on local hardware, local-first, privacy-first.

## Repo

- GitHub: https://github.com/pewdiepie-archdaemon/odysseus
- Stack: Python 3.11+, FastAPI, asyncio, SQLite, ChromaDB, SearXNG
- Deploy: Docker Compose (recommended), native Linux/macOS

## Features

| Feature | How it works |
|---------|-------------|
| **Chat** | Any local model (vLLM, llama.cpp, Ollama) or API (OpenRouter, OpenAI, GitHub Copilot) |
| **Agent** | Built on [opencode](https://github.com/anomalyco/opencode) — tools: MCP, web, files, shell, skills, memory |
| **Cookbook** | Hardware scan → model recommendation → auto-download/serve. Built on [llmfit](https://github.com/AlexsJones/llmfit). VRAM-aware, supports GGUF/FP8/AWQ |
| **Deep Research** | Iterative LLM-in-the-loop research engine (see below) |
| **Compare** | Blind multi-model side-by-side comparison |
| **Documents** | Multi-tab editor: Markdown, HTML, CSV, syntax highlighting, AI edits |
| **Memory / Skills** | ChromaDB + fastembed (ONNX). Vector + keyword retrieval, import/export |
| **Email** | IMAP/SMTP inbox with AI triage: auto-summarize, auto-reply drafts, auto-tag, auto-spam |
| **Notes & Tasks** | Quick notes with reminders, todo list, cron-style tasks with ntfy/browser/email channels |
| **Calendar** | CalDAV sync (Radicale, Nextcloud, Apple, Fastmail) |
| **Extras** | Image editor, theme editor, file uploads (vision + PDF), web search, presets, sessions, 2FA |

## Email System

**Protocol:** Raw IMAP + SMTP. No OAuth, no provider-specific APIs.

- Multi-account support (stored in `EmailAccount` DB table with encrypted passwords)
- Background pollers: auto-summarize, auto-reply, auto-tag, auto-spam classification
- AI features: writing style extraction from sent emails, urgency detection, calendar event extraction from email bodies
- Attachment extraction: PDF, DOCX, TXT/MD — can be opened as documents in the doc editor
- Sent folder auto-detection: handles Gmail (`[Gmail]/Sent Mail`), Outlook (`Sent Items`), Dovecot (`Sent`)
- Drafts stored in IMAP Drafts folder

**Gmail compatibility:** Works with App Passwords (2FA required). Configure:
- IMAP: `imap.gmail.com:993` (SSL)
- SMTP: `smtp.gmail.com:465` (SSL)
- No OAuth/API needed — standard IMAP credentials

## Deep Research

**Inspired by:** Alibaba's [IterResearch](https://github.com/Alibaba-NLP/DeepResearch) (Apache 2.0 license in repo)

**Architecture:** `src/deep_research.py` — `DeepResearcher` class runs an iterative loop:

1. **Plan** — LLM breaks question into 3-6 sub-questions + key topics
2. **Search** — LLM generates focused queries → SearXNG/Brave/Tavily
3. **Extract** — Top URL pages fetched, LLM extracts goal-relevant info only
4. **Synthesize** — New findings integrated into evolving report
5. **Decide** — LLM judges: "is this comprehensive enough?" (YES/NO)
6. **Final** — LLM writes polished 1500+ word report with category-specific formatting (product, comparison, howto, factcheck)

**Key design choices:**
- LLM-in-the-loop: the model drives every decision (what to search, what's relevant, when to stop)
- Auto-detects research category and applies format overrides
- Max rounds capped at 20 (auto-detects early stop)
- Results persisted to `data/deep_research/<session_id>.json`
- Visual HTML report generation
- Can spin off into a new chat session with report as context
- Search providers: SearXNG (default, bundled in Docker), Brave, Tavily, or disabled

**To reproduce:** Study `src/deep_research.py` (~700 lines). The `DeepResearcher.research()` method is the core algorithm.

## Key Architectural Notes

- **Modular routes:** Every feature has its own route file under `routes/` (e.g., `email_routes.py`, `research_routes.py`)
- **Connection pooling:** IMAP connections pooled per-account to avoid TCP+TLS+LOGIN handshake overhead
- **Caching:** 8s TTL for email list cache, 30m TTL for email body cache
- **Background tasks:** asyncio-based pollers for scheduled emails and auto-summarize
- **Multi-user:** Owner-scoped queries on all data (accounts, emails, research results)
- **Secret storage:** Fernet-encrypted credentials at rest

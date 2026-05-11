# CodexBar usage-provider sync plan

## Goal

Keep Nexus slashusage behavior aligned with CodexBar provider usage fixes without copying unrelated menu-bar UI code.

## Command

Run:

```bash
just codexbar-sync
```

To record the upstream commit after a sync review:

```bash
just codexbar-sync --mark
```

The marker is stored in `.codexbar-sync.json`.

## Sync workflow

1. Run `just codexbar-sync`.
2. Review commits and usage-relevant files reported since `.codexbar-sync.json:lastSyncedCommit`.
3. Inspect changed CodexBar provider files under `Sources/CodexBarCore/Providers/` and relevant docs.
4. Port only provider auth, fetch, parser, and mapping logic needed by `packages/extension-core/src/slashusage/`.
5. Add or update deterministic parser/detection tests under `test/slash-usage/`.
6. Run targeted usage tests.
7. Run `just codexbar-sync --mark` only after imported changes are validated.

## Provider parity target

CodexBar currently tracks these providers: Codex, Claude, Cursor, OpenCode, OpenCode Go, Alibaba, Droid/Factory, Gemini, Antigravity, Copilot, z.ai, MiniMax, Kimi, Kilo, Kiro, Vertex AI, Augment, JetBrains AI, Kimi K2, Amp, Ollama, Synthetic, Warp, OpenRouter, Perplexity, Abacus AI, and Mistral.

Nexus usage parity should be implemented provider-by-provider with source-backed tests instead of one unverified bulk port.

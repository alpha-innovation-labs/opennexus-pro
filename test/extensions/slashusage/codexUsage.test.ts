import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fetchCodexUsage } from "../../../packages/extension-core/src/slashusage/providers/codex/fetchCodexUsage.js";

/**
 * Runs a test with isolated Codex auth storage and a mocked usage response.
 *
 * @param data Usage endpoint response body.
 * @param fn Test function.
 */
async function withMockedCodexUsage(data: unknown, fn: () => Promise<void>): Promise<void> {
  const previousCodexHome = process.env.CODEX_HOME;
  const previousFetch = globalThis.fetch;
  const dir = await mkdtemp(join(tmpdir(), "nexus-codex-usage-"));
  process.env.CODEX_HOME = dir;
  await writeFile(join(dir, "auth.json"), JSON.stringify({ OPENAI_API_KEY: "test-token" }));
  globalThis.fetch = async () => new Response(JSON.stringify(data), { status: 200, headers: { "content-type": "application/json" } });
  try {
    await fn();
  } finally {
    if (previousCodexHome === undefined) delete process.env.CODEX_HOME;
    else process.env.CODEX_HOME = previousCodexHome;
    globalThis.fetch = previousFetch;
    await rm(dir, { recursive: true, force: true });
  }
}

test("codex usage ignores zero-length rate windows", async () => {
  await withMockedCodexUsage({
    rate_limit: {
      primary_window: { limit_window_seconds: 0, used_percent: 0 },
      secondary_window: { limit_window_seconds: 604_800, used_percent: 10 },
    },
    additional_rate_limits: [{
      limit_name: "GPT-5.3-Codex-Spark",
      rate_limit: { primary_window: { limit_window_seconds: 0, used_percent: 0 } },
    }],
  }, async () => {
    const snapshot = await fetchCodexUsage();

    assert.deepEqual(snapshot.windows.map((window) => window.label), ["Week"]);
  });
});
